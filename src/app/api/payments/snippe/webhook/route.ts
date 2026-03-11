import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { parseSnippeWebhookEvent, verifySnippeWebhookSignature } from "@/lib/snippe";
import { sendWhatsAppMessage } from "@/lib/twilio";

export async function POST(request: NextRequest) {
  const payload = await request.text();
  const signature = request.headers.get("X-Webhook-Signature");
  const eventName = request.headers.get("X-Webhook-Event");

  if (process.env.SNIPPE_WEBHOOK_SECRET && !verifySnippeWebhookSignature(payload, signature)) {
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 401 });
  }

  try {
    const event = parseSnippeWebhookEvent(payload);
    if (eventName && eventName !== event.type) {
      return NextResponse.json({ error: "Webhook event mismatch" }, { status: 400 });
    }

    const payment = await db.payment.findUnique({
      where: { transactionRef: event.data.reference },
      include: {
        user: true,
        order: true,
        creditLine: true,
      },
    });

    if (!payment) {
      return NextResponse.json({ received: true, ignored: true });
    }

    if (event.type === "payment.completed") {
      await db.payment.update({
        where: { id: payment.id },
        data: {
          status: "COMPLETED",
          mpesaReceiptNo: event.data.external_reference,
          paidAt: event.data.completed_at ? new Date(event.data.completed_at) : new Date(),
          notes: payment.notes
            ? `${payment.notes}\nSnippe payment completed via ${event.data.reference}`
            : `Snippe payment completed via ${event.data.reference}`,
        },
      });

      if (payment.orderId) {
        const completedPayments = await db.payment.findMany({
          where: {
            orderId: payment.orderId,
            status: "COMPLETED",
          },
        });

        const paidTzs = completedPayments.reduce((sum, item) => sum + item.amountTzs, 0);
        if (payment.order && paidTzs >= payment.order.totalTzs) {
          await db.order.update({
            where: { id: payment.orderId },
            data: { status: "COMPLETED" },
          });
        }
      }

      if (payment.creditLineId && payment.creditLine) {
        const updatedPaidAmount = payment.creditLine.paidAmount + payment.amountUsd;
        await db.creditLine.update({
          where: { id: payment.creditLineId },
          data: {
            paidAmount: updatedPaidAmount,
            status: updatedPaidAmount >= payment.creditLine.amountUsd ? "PAID" : "ACTIVE",
          },
        });
      }

      if (payment.user.phone) {
        const orderLabel = payment.order?.orderNumber ? ` for order ${payment.order.orderNumber}` : "";
        await sendWhatsAppMessage(
          payment.user.phone,
          `Malipo yako ya M-Pesa${orderLabel} yamekamilika. Reference: ${event.data.external_reference ?? event.data.reference}.`
        );
      }
    }

    if (event.type === "payment.failed") {
      await db.payment.update({
        where: { id: payment.id },
        data: {
          status: "FAILED",
          notes: payment.notes
            ? `${payment.notes}\nSnippe payment failed: ${event.data.failure_reason ?? "unknown reason"}`
            : `Snippe payment failed: ${event.data.failure_reason ?? "unknown reason"}`,
        },
      });

      if (payment.user.phone) {
        await sendWhatsAppMessage(
          payment.user.phone,
          `Malipo yako ya M-Pesa yameshindwa. ${event.data.failure_reason ?? "Jaribu tena baadaye."}`
        );
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to handle Snippe webhook" }, { status: 500 });
  }
}
