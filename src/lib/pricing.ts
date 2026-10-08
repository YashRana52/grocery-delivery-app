// cart (client) aur order API (server) dono yahi logic use karte hain
export function getDeliveryFee(subTotal: number) {
  if (subTotal === 0) return 0;
  if (subTotal < 200) return 40;
  if (subTotal < 400) return 25;
  if (subTotal < 500) return 10;
  return 0;
}
