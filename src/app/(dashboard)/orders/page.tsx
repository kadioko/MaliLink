import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { OrdersClientPage } from "./orders-client-page";

const ORDER_STATUSES = ["SUBMITTED", "CONFIRMED", "PROCESSING", "SHIPPED", "IN_CUSTOMS", "DELIVERED", "COMPLETED"] as const;

export default async function OrdersPage({
  searchParams,
}: {
  searchParams?: { status?: string; new?: string };
}) {
  const session = await getServerSession(authOptions);
  const statusFilter =
    searchParams?.status && ORDER_STATUSES.includes(searchParams.status as (typeof ORDER_STATUSES)[number])
      ? searchParams.status
      : "ALL";

  const where =
    session?.user.role === "SUPPLIER"
      ? { supplierId: session.user.id }
      : session?.user.role === "IMPORTER"
        ? { importerId: session.user.id }
        : {};

  const orders = await db.order.findMany({
    where,
    include: {
      items: true,
      supplier: { select: { businessName: true } },
      importer: { select: { businessName: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const suppliers =
    session?.user.role === "IMPORTER"
      ? await db.user.findMany({
          where: {
            role: "SUPPLIER",
            products: {
              some: { inStock: true },
            },
          },
          select: {
            id: true,
            businessName: true,
            location: true,
            products: {
              where: { inStock: true },
              orderBy: { createdAt: "desc" },
              select: {
                id: true,
                name: true,
                category: true,
                unit: true,
                moq: true,
                priceTzs: true,
                inStock: true,
                imageUrls: true,
                description: true,
              },
            },
          },
          orderBy: { businessName: "asc" },
        })
      : [];

  return (
    <OrdersClientPage
      role={session?.user.role ?? "IMPORTER"}
      userName={session?.user.businessName}
      initialStatusFilter={statusFilter}
      initialOrders={orders}
      suppliers={suppliers}
      orderStatuses={ORDER_STATUSES}
    />
  );
}
