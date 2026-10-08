import connectDb from "@/lib/db";
import CategorySlider from "./CategorySlider";
import GroceryitemCard from "./GroceryitemCard";
import HeroSerction from "./heroSerction";
import Grocery from "@/models/grocery.model";
import ScrollToProducts from "./ScrollManage";
import Footer from "./Footer";

async function UserDashboard({ search }: { search?: string }) {
  await connectDb();

  // user input ko regex me direct dalne se "(" jaise char pe page crash hota tha
  const safeSearch = search?.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const groceries = await Grocery.find(
    safeSearch
      ? {
          name: { $regex: safeSearch, $options: "i" },
        }
      : {},
  );

  const plainGrocery = JSON.parse(JSON.stringify(groceries));
  const noResults = plainGrocery?.length === 0;

  return (
    <>
      <HeroSerction />
      <CategorySlider />
      <ScrollToProducts />

      <div className="w-[90%] md:w-[80%] mx-auto mt-10" id="products-section">
        <h2 className="text-2xl md:text-3xl text-green-700 mb-6 text-center font-bold">
          Popular Grocery Items
        </h2>

        {noResults ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <h3 className="text-xl md:text-2xl font-semibold text-gray-300 mb-2">
              😕 No items found
            </h3>

            {search && (
              <p className="text-gray-400">
                No results found for{" "}
                <span className="text-green-400 font-medium">&quot;{search}&quot;</span>
              </p>
            )}

            <p className="text-sm text-gray-500 mt-2">
              Try searching something else or check spelling
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 mb-8">
            {plainGrocery.map((item: any) => (
              <GroceryitemCard item={item} key={item._id} />
            ))}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}

export default UserDashboard;
