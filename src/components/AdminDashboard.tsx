import connectDb from "@/lib/db";
import AdminDashboardClient from "./AdminDashboardClient";
import Order from "@/models/order.model";
import User from "@/models/user.model";
import Grocery from "@/models/grocery.model";
import Footer from "./Footer";
import AdminFooter from "./AdminFooter";

async function AdminDashboard() {
  await connectDb();

  const orders = await Order.find({});
  const users = await User.find({ role: "user" });
  const groceries = await Grocery.find({});

  const totalOrders = orders.length;
  const totalCustomers = users.length;
  const pendingDeliveries = orders.filter((o) => o.status === "pending").length;

  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  //  DATE SETUP
  const today = new Date();

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(today.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  //  TODAY REVENUE
  const todayRevenue = orders
    .filter((o) => new Date(o.createdAt) >= startOfToday)
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  //  LAST 7 DAYS REVENUE
  const sevenDayRevenue = orders
    .filter((o) => new Date(o.createdAt) >= sevenDaysAgo)
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  //  STATS
  const stats = [
    { title: "Total Orders", value: totalOrders },
    { title: "Total Customers", value: totalCustomers },
    { title: "Pending Deliveries", value: pendingDeliveries },
    { title: "Total Revenue", value: totalRevenue },
  ];

  //  CHART DATA (LAST 7 DAYS INCLUDING TODAY)
  const chartData = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    date.setHours(0, 0, 0, 0);

    const nextDay = new Date(date);
    nextDay.setDate(date.getDate() + 1);

    const ordersCount = orders.filter(
      (o) => new Date(o.createdAt) >= date && new Date(o.createdAt) < nextDay,
    ).length;

    chartData.push({
      day: date.toLocaleDateString("en-US", { weekday: "short" }),
      orders: ordersCount,
    });
  }

  return (
    <>
      <AdminDashboardClient
        earning={{
          today: todayRevenue,
          sevenDays: sevenDayRevenue,
          total: totalRevenue,
        }}
        stats={stats}
        chartData={chartData}
      />
      <AdminFooter />
    </>
  );
}

export default AdminDashboard;
