import { Session } from "next-auth";

type OrderLike = {
  user?: unknown;
  assignedDeliveryBoy?: unknown;
};

const idOf = (value: unknown) => {
  if (!value) return "";
  if (typeof value === "object" && "_id" in value) {
    return String((value as { _id: unknown })._id);
  }
  return String(value);
};

// order ko sirf uska customer, assigned delivery boy ya admin dekh sakta hai
export function canAccessOrder(session: Session | null, order: OrderLike) {
  const userId = session?.user?.id;
  if (!userId) return false;
  if (session?.user?.role === "admin") return true;
  return (
    idOf(order.user) === userId || idOf(order.assignedDeliveryBoy) === userId
  );
}
