import mongoose from "mongoose";

export interface IDeliveryAssignment {
  _id?: mongoose.Types.ObjectId;
  order: mongoose.Types.ObjectId;
  broadcastedTo: mongoose.Types.ObjectId[];
  assignedTo: mongoose.Types.ObjectId | null;
  status: "broadcasted" | "assigned" | "completed";
  acceptedAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

const deliveryAssignmentSchema = new mongoose.Schema<IDeliveryAssignment>(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },

    broadcastedTo: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    status: {
      type: String,
      enum: ["broadcasted", "assigned", "completed"],
      default: "broadcasted",
    },

    acceptedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

deliveryAssignmentSchema.index({ order: 1 });
deliveryAssignmentSchema.index({ assignedTo: 1 });
deliveryAssignmentSchema.index({ status: 1 });

const DeliveryAssignment =
  mongoose.models.DeliveryAssignment ||
  mongoose.model("DeliveryAssignment", deliveryAssignmentSchema);

export default DeliveryAssignment;
