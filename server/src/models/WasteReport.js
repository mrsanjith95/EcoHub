import mongoose from 'mongoose';

const wasteReportSchema = new mongoose.Schema(
  {
    generatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    category: {
      type: String,
      required: [true, 'Waste category is required'],
    },
    items: [
      {
        category: {
          type: String,
          enum: ['Organic', 'Plastic', 'Paper', 'Glass', 'Metal', 'E-Waste', 'Mixed Waste'],
          required: true,
        },
        quantityKg: {
          type: Number,
          required: true,
          min: 0.01,
        },
      },
    ],
    quantityKg: {
      type: Number,
      required: [true, 'Quantity in kg is required'],
      min: [0.1, 'Quantity must be at least 0.1 kg'],
    },
    description: {
      type: String,
      default: '',
    },
    imageUrl: {
      type: String,
      default: '',
    },
    pickupLocation: {
      address: { type: String, required: true },
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
    },
    status: {
      type: String,
      enum: ['Pending', 'Accepted', 'Collected', 'Delivered', 'Processing', 'Completed', 'Cancelled'],
      default: 'Pending',
    },
    assignedCollectorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    assignedHubId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProcessingHub',
      default: null,
    },
    timeline: [
      {
        status: { type: String, required: true },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        note: { type: String, default: '' },
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const WasteReport = mongoose.model('WasteReport', wasteReportSchema);
export default WasteReport;
