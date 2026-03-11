import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { calculatePlatformFee, getUsdToTzsRate } from "@/lib/utils";
import { createSnippePaymentSession } from "@/lib/snippe";

const createSnippeSessionSchema = z.object({
  orderId: z.string(),
});

function getAppBaseUrl(request: NextRequest) {
  return process.env.NEXTAUTH_URL || new URL(request.url).origin;
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const data = createSnippeSessionSchema.parse(body);

    const [order, user] = await Promise.all([
      db.order.findUnique({
        where: { id: data.orderId },
        include: {
          payments: { where: { status: { in: ["PENDING", "PROCESSING", "COMPLETED"] } } },
          items: { include: { product: true } },
        },
      }),
      db.user.findUnique({ where: { id: session.user.id } }),
    ]);

    if (!order || order.importerId !== session.user.id) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (!user?.phone) {
      return NextResponse.json({ error: "A phone number is required before starting an M-Pesa payment." }, { status: 400 });
    }

    const paidTzs = order.payments.reduce(
      (sum: number, payment: (typeof order.payments)[number]) => sum + payment.amountTzs,
      0
    );
    const outstandingTzs = Math.max(order.totalTzs - paidTzs, 0);

    if (outstandingTzs <= 0) {
      return NextResponse.json({ error: "This order is already fully paid." }, { status: 400 });
    }

    const exchangeRate = order.exchangeRate || getUsdToTzsRate();
    const amountUsd = Number((outstandingTzs / exchangeRate).toFixed(2));
    const platformFeeUsd = calculatePlatformFee(amountUsd);
    const baseUrl = getAppBaseUrl(request);
    const idempotencyKey = `snippe-order-${order.id}-${Math.round(outstandingTzs)}`;

    const snippeSession = await createSnippePaymentSession(
      {
        amount: Math.round(outstandingTzs),
        customer: {
          name: user.name,
          phone: user.phone,
          email: user.email,
        },
        description: `Payment for order ${order.orderNumber}`,
        metadata: {
          order_id: order.id,
          order_number: order.orderNumber,
          importer_id: order.importerId,
        },
        redirectUrl: `${baseUrl}/payments?snippe=return&order=${order.id}`,
        webhookUrl: `${baseUrl}/api/payments/snippe/webhook`,
      },
      idempotencyKey
    );

    const payment = await db.payment.create({
      data: {
        userId: session.user.id,
        orderId: order.id,
        amountUsd,
        amountTzs: Math.round(outstandingTzs),
        method: "MPESA",
        status: "PENDING",
        transactionRef: snippeSession.reference,
        notes: `Snippe checkout session ${snippeSession.id}`,
        platformFeeUsd,
      },
    });

    return NextResponse.json(
      {
        payment,
        paymentId: payment.id,
        paymentStatus: payment.status,
        checkoutUrl: snippeSession.checkout_url,
        paymentLinkUrl: snippeSession.payment_link_url,
        shortCode: snippeSession.short_code,
        reference: snippeSession.reference,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create Snippe payment session" },
      { status: 500 }
    );
  }
}
