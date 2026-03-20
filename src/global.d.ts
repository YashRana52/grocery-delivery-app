import { Connection } from "mongoose";

declare global {
  var mongoose: {
    conn: Connection | null;
    promise: Promise<Connection> | null;
  };
}
declare module "leaflet/dist/leaflet.css";

export {};
