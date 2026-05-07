import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { ArrowLeft, Box, Building2, Calendar, FileText, MapPin, Package, Truck } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatTzsFromUsd, formatTzs } from "@/lib/utils";
import { Badge, PageHeader, SectionCard, StatCard } from "@/components/dashboard-ui";
import { OrderActions } from "./order-actions";
import { OrderMessages } from "./order-messages";

const statusToneMap: Record<string, "warning" | "success" | "danger" | "info" | "default"> = {
  DRAFT: "default",
  SUBMITTED: "warning",
  CONFIRMED: "info",
  PROCESSING: "info",
  SHIPPED: "warning",
  IN_CUSTOMS: "warning",
  DELIVERED: "success",
  COMPLETED: "success",
  CANCELLED: "danger",
  DISPUTED: "danger",
};

const ORDER_TIMELINE = [
  { status: "SUBMITTED", label: "Submitted", icon: FileText },
  { status: "CONFIRMED", label: "Confirmed", icon: Building2 },
  { status: "PROCESSING", label: "Processing", icon: Box },
  { status: "SHIPPED", label: "Shipped", icon: Truck },
  { status: "IN_CUSTOMS", label: "In Customs", icon: MapPin },
  { status: "DELIVERED", label: "Delivered", icon: Package },
  { status: "COMPLETED", label: "Completed", icon: Calendar },
];

const STATUS_ORDER = ["DRAFT", "SUBMITTED", "CONFIRMED", "PROCESSING", "SHIPPED", "IN_CUSTOMS", "DELIVERED", "COMPLETED"];

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login?callbackUrl=/orders");

  const order = await db.order.findUnique({
    where: { id: params.id },
    include: {
      items: {
        include: {
          product: {
            select: { name: true, unit: true, category: true, imageUrls: true },
          },
        },
      },
      supplier: { select: { id: true, businessName: true, name: true, email: true, phone: true, location: true } },
      importer: { select: { id: true, businessName: true, name: true, email: true, phone: true, location: true } },
      payments: { orderBy: { createdAt: "desc" } },
      creditLine: true,
      messages: {
        include: { sender: { select: { name: true, role: true } } },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  if (!order) notFound();

  const role = session.user.role;
  const canView =
    role === "ADMIN" ||
    (role === "IMPORTER" && order.importerId === session.user.id) ||
    (role === "SUPPLIER" && order.supplierId === session.user.id);

  if (!canView) notFound();

  const totalPaidTzs = order.payments
    .filter((p) => p.status === "COMPLETED")
    .reduce((sum, p) => sum + p.amountTzs, 0);
  const remainingTzs = order.totalTzs - totalPaidTzs;

  const currentStatusIndex = STATUS_ORDER.indexOf(order.status);
  const counterparty = role === "SUPPLIER" ? order.importer : order.supplier;

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6">
      <div className="flex items-center gap-3">
        <Link
          href="/orders"
          className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" />
          All Orders
        </Link>
      </div>

      <PageHeader
        title={order.orderNumber}
        description={`Placed on ${new Date(order.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })} via ${order.source}`}
        badge={<Badge tone={statusToneMap[order.status] ?? "default"}>{order.status}</Badge>}
        action={
          order.source === "WHATSAPP" ? (
            <Badge tone="success">WhatsApp Order</Badge>
          ) : null
        }
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Order Total" value={formatTzsFromUsd(order.totalUsd)} tone="default" />
        <StatCard label="Amount Paid" value={formatTzs(totalPaidTzs)} tone="success" />
        <StatCard label="Remaining" value={formatTzs(Math.max(0, remainingTzs))} tone={remainingTzs > 0 ? "warning" : "success"} />
        <StatCard label="Items" value={String(order.items.length)} tone="info" />
      </div>

      {order.status !== "CANCELLED" && order.status !== "DISPUTED" ? (
        <SectionCard title="Order Progress" description="Current stage in the order lifecycle.">
          <div className="flex items-center gap-1 overflow-x-auto pb-2">
            {ORDER_TIMELINE.map((step, idx) => {
              const stepIndex = STATUS_ORDER.indexOf(step.status);
              const isDone = stepIndex < currentStatusIndex;
              const isCurrent = stepIndex === currentStatusIndex;
              const Icon = step.icon;
              return (
                <div key={step.status} className="flex items-center">
                  <div className={`flex flex-col items-center gap-1.5 min-w-[72px] ${isCurrent ? "opacity-100" : isDone ? "opacity-70" : "opacity-30"}`}>
                    <div className={`flex h-9 w-9 items-center justify-center rounded-full border-2 ${isCurrent ? "border-emerald-500 bg-emerald-500 text-white" : isDone ? "border-emerald-400 bg-emerald-50 text-emerald-600" : "border-gray-200 bg-white text-gray-400"}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <p className="text-center text-[11px] font-medium leading-tight text-gray-600">{step.label}</p>
                  </div>
                  {idx < ORDER_TIMELINE.length - 1 ? (
                    <div className={`h-0.5 w-8 flex-shrink-0 rounded-full ${stepIndex < currentStatusIndex ? "bg-emerald-400" : "bg-gray-200"}`} />
                  ) : null}
                </div>
              );
            })}
          </div>
        </SectionCard>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <SectionCard title="Order Items" description={`${order.items.length} line item${order.items.length !== 1 ? "s" : ""} in this order`}>
          <div className="space-y-3">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-4 rounded-2xl border border-gray-100 bg-gray-50/80 px-4 py-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-lg">
                    📦
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-medium text-gray-900 text-sm">{item.product.name}</p>
                    <p className="text-xs text-gray-500">{item.product.category} · {item.product.unit}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold text-gray-900">{formatTzsFromUsd(item.totalPrice)}</p>
                  <p className="text-xs text-gray-500">×{item.quantity} at {formatTzsFromUsd(item.unitPrice)}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 space-y-2 rounded-2xl border border-gray-100 bg-white px-4 py-3 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span><span>{formatTzsFromUsd(order.subtotalUsd)}</span>
            </div>
            {order.shippingUsd > 0 ? (
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span><span>{formatTzsFromUsd(order.shippingUsd)}</span>
              </div>
            ) : null}
            {order.dutyUsd > 0 ? (
              <div className="flex justify-between text-gray-600">
                <span>Duty</span><span>{formatTzsFromUsd(order.dutyUsd)}</span>
              </div>
            ) : null}
            <div className="flex justify-between border-t border-gray-100 pt-2 font-semibold text-gray-900">
              <span>Total</span><span>{formatTzsFromUsd(order.totalUsd)}</span>
            </div>
          </div>
        </SectionCard>

        <div className="space-y-6">
          <SectionCard title={role === "SUPPLIER" ? "Importer Details" : "Supplier Details"} description="Counterparty contact information.">
            <div className="space-y-3">
              <div className="flex items-center gap-3 rounded-xl bg-gray-50 px-3 py-2.5">
                <Building2 className="h-4 w-4 shrink-0 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-400">Business</p>
                  <p className="text-sm font-medium text-gray-800">{counterparty.businessName}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl bg-gray-50 px-3 py-2.5">
                <MapPin className="h-4 w-4 shrink-0 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-400">Location</p>
                  <p className="text-sm font-medium text-gray-800">{counterparty.location ?? "—"}</p>
                </div>
              </div>
            </div>
          </SectionCard>

          {order.notes ? (
            <SectionCard title="Order Notes" description="Notes attached to this order.">
              <p className="text-sm leading-6 text-gray-600">{order.notes}</p>
            </SectionCard>
          ) : null}

          {order.estimatedDelivery ? (
            <SectionCard title="Estimated Delivery" description="Expected delivery date.">
              <p className="text-sm font-medium text-gray-800">
                {new Date(order.estimatedDelivery).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
              </p>
            </SectionCard>
          ) : null}

          {order.payments.length > 0 ? (
            <SectionCard title="Payment History" description="Completed payment records.">
              <div className="space-y-2">
                {order.payments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2.5">
                    <div>
                      <p className="text-xs font-medium text-gray-700">{payment.method}</p>
                      <p className="text-xs text-gray-400">{new Date(payment.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">{formatTzs(payment.amountTzs)}</p>
                      <Badge tone={payment.status === "COMPLETED" ? "success" : payment.status === "FAILED" ? "danger" : "warning"}>{payment.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          ) : null}

          <SectionCard title="Order Actions" description="Advance or update the current order status.">
            <OrderActions
              orderId={order.id}
              currentStatus={order.status}
              role={role as "IMPORTER" | "SUPPLIER" | "ADMIN"}
            />
            {role === "IMPORTER" && !["COMPLETED", "CANCELLED", "DISPUTED"].includes(order.status) ? (
              <p className="mt-2 text-xs text-gray-400">Contact your supplier to advance this order.</p>
            ) : null}
          </SectionCard>
        </div>
      </div>

      <SectionCard
        title="Order Messages"
        description="Direct messages between importer and supplier for this order."
      >
        <OrderMessages
          orderId={order.id}
          currentUserId={session.user.id}
          currentUserRole={role}
          initialMessages={order.messages.map((m) => ({
            id: m.id,
            content: m.content,
            createdAt: m.createdAt.toString(),
            sender: { name: m.sender.name, role: m.sender.role },
            senderId: m.senderId,
          }))}
        />
      </SectionCard>
    </div>
  );
}
