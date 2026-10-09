import mongoose from 'mongoose';

const processingHubSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Hub name is required'],
      trim: true,
    },
    operatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
    },
    location: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
    },
    acceptedCategories: [
      {
        type: String,
        enum: ['Organic', 'Plastic', 'Paper', 'Glass', 'Metal', 'E-Waste', 'Mixed Waste'],
        required: true,
      },
    ],
    capacityKgPerDay: {
      type: Number,
      default: 1000,
    },
    currentStockKg: {
      type: Number,
      default: 0,
    },
    contactPhone: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

const ProcessingHub = mongoose.model('ProcessingHub', processingHubSchema);
export default ProcessingHub;
