import { auth } from "@/auth";
import DeliveryBoyDashboard from "./DeliveryBoyDashboard";
import Order from "@/models/order.model";
import connectDb from "@/lib/db";
import Footer from "./Footer";

async function DeliveryBoy() {
  await connectDb();

  const session = await auth();
  const deliveryBoyId = session?.user?.id;

  const today = new Date();
  const startOfToday = new Date(today.setHours(0, 0, 0, 0));

  const last7Days = new Date();
  last7Days.setDate(last7Days.getDate() - 6); // including today

  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  //  Single DB Call
  const orders = await Order.find({
    assignedDeliveryBoy: deliveryBoyId,
    deliveryOtpVerification: true,
  });

  //  TODAY EARNING

  const todayOrders = orders.filter(
    (o) => o.deliveredAt && new Date(o.deliveredAt) >= startOfToday,
  );

  const todayEarning = todayOrders.length * 40;

  //  LAST 7 DAYS EARNING

  const last7DaysOrders = orders.filter(
    (o) => o.deliveredAt && new Date(o.deliveredAt) >= last7Days,
  );

  const last7DaysEarning = last7DaysOrders.length * 40;

  //  DAILY BREAKDOWN

  const dailyData: { date: string; orders: number; earning: number }[] = [];

  for (let i = 0; i < 7; i++) {
    const day = new Date();
    day.setDate(day.getDate() - i);

    const start = new Date(day.setHours(0, 0, 0, 0));
    const end = new Date(day.setHours(23, 59, 59, 999));

    const dayOrders = orders.filter(
      (o) =>
        o.deliveredAt &&
        new Date(o.deliveredAt) >= start &&
        new Date(o.deliveredAt) <= end,
    );

    dailyData.push({
      date: start.toDateString(),
      orders: dayOrders.length,
      earning: dayOrders.length * 40,
    });
  }

  dailyData.reverse();

  //  TOTAL LIFETIME EARNING

  const totalEarning = orders.length * 40;

  //  MONTH-WISE EARNING

  const monthlyMap: Record<string, number> = {};

  orders.forEach((o) => {
    if (!o.deliveredAt) return;

    const date = new Date(o.deliveredAt);
    const key = `${date.getFullYear()}-${date.getMonth() + 1}`;

    if (!monthlyMap[key]) {
      monthlyMap[key] = 0;
    }

    monthlyMap[key] += 40;
  });

  const monthlyData = Object.entries(monthlyMap).map(([month, earning]) => ({
    month,
    earning,
  }));

  return (
    <>
      <DeliveryBoyDashboard
        earning={{
          today: todayEarning,
          last7Days: last7DaysEarning,
          total: totalEarning,
          dailyData,
          monthlyData,
        }}
      />
      <Footer />
    </>
  );
}

export default DeliveryBoy;
