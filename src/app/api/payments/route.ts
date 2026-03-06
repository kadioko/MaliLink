import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { db } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import { calculatePlatformFee } from "@/lib/utils";

const createPaymentSchema = z.object({
  orderId: z.string().optional(),
  creditLineId: z.string().optional(),
  amountUsd: z.number().positive(),
  method: z.enum(["MPESA", "BANK_TRANSFER", "CASH", "CREDIT", "TIGO_PESA", "AIRTEL_MONEY"]),
  transactionRef: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const payments = await db.payment.findMany({
    where: { userId: session.user.id },
    include: {
      order: { select: { orderNumber: true, status: true } },
      creditLine: { select: { id: true, status: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ payments });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const data = createPaymentSchema.parse(body);

    const exchangeRate = 2500; // TODO: live rate
    const platformFeeUsd = calculatePlatformFee(data.amountUsd);

    const payment = await db.payment.create({
      data: {
        userId: session.user.id,
        orderId: data.orderId,
        creditLineId: data.creditLineId,
        amountUsd: data.amountUsd,
        amountTzs: data.amountUsd * exchangeRate,
        method: data.method,
        transactionRef: data.transactionRef,
        platformFeeUsd,
      },
    });

    // If paying for a credit line, update paid amount
    if (data.creditLineId) {
      const creditLine = await db.creditLine.findUnique({
        where: { id: data.creditLineId },
      });

      if (creditLine) {
        const newPaidAmount = creditLine.paidAmount + data.amountUsd;
        const newStatus = newPaidAmount >= creditLine.amountUsd ? "PAID" : "ACTIVE";

        await db.creditLine.update({
          where: { id: data.creditLineId },
          data: { paidAmount: newPaidAmount, status: newStatus },
        });
      }
    }

    return NextResponse.json({ payment }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to process payment" }, { status: 500 });
  }
}
