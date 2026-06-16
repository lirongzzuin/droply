import { redirect } from "next/navigation";
import { TopBar } from "@/components/TopBar";
import { OrdersList } from "@/components/OrdersList";
import { getCurrentUser } from "@/lib/session";
import { listMyOrders } from "@/lib/services/order";

export const metadata = { title: "주문 내역" };

export default function OrdersPage() {
  const user = getCurrentUser();
  if (!user) redirect("/login");
  const orders = listMyOrders(user.id).map((o) => ({
    id: o.id,
    artworkId: o.artworkId,
    artworkTitle: o.artworkTitle,
    artworkImage: o.artworkImage,
    sellerHandle: o.sellerHandle,
    amount: o.amount,
    feeAmount: o.feeAmount,
    method: o.method,
    status: o.status,
    reviewed: o.reviewed,
    createdAt: o.createdAt,
  }));

  return (
    <>
      <TopBar variant="back" title="주문 내역" actions={<span />} />
      <main className="pt-16 pb-24 px-container-margin mt-stack-lg">
        <OrdersList orders={orders} />
      </main>
    </>
  );
}
