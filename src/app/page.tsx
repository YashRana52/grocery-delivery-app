import { auth } from "@/auth";
import AdminDashboard from "@/components/AdminDashboard";
import DeliveryBoy from "@/components/DeliveryBoy";
import EditRoleMobile from "@/components/EditRoleMobile";
import GeoUpdater from "@/components/GeoUpdater";
import Nav from "@/components/Nav";
import UserDashboard from "@/components/UserDashboard";
import connectDb from "@/lib/db";
import User from "@/models/user.model";
import { redirect } from "next/navigation";

export default async function Home({ searchParams }: any) {
  await connectDb();
  const session = await auth();
  const params = await searchParams;

  const search = params.search;

  const user = await User.findById(session?.user?.id);

  if (!user) {
    redirect("/login");
  }

  const inComplete =
    !user.mobile || !user.role || (!user.mobile && user.role === "user");

  if (inComplete) {
    return <EditRoleMobile />;
  }

  const plainUser = JSON.parse(JSON.stringify(user));

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-black text-white">
      <Nav user={plainUser} />
      <GeoUpdater userId={plainUser._id} />

      {user.role == "user" ? (
        <UserDashboard search={search} />
      ) : user.role == "admin" ? (
        <AdminDashboard />
      ) : (
        <DeliveryBoy />
      )}
    </div>
  );
}
