import mongoose from 'mongoose';

const processingRecordSchema = new mongoose.Schema(
  {
    wasteReportId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WasteReport',
      required: true,
    },
    hubId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProcessingHub',
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    inputQuantityKg: {
      type: Number,
      required: true,
    },
    processedQuantityKg: {
      type: Number,
      required: true,
    },
    processingMethod: {
      type: String,
      enum: ['Recycled', 'Composted', 'Recovered', 'Sent for further treatment'],
      required: true,
    },
    recycledQuantityKg: {
      type: Number,
      default: 0,
    },
    compostedQuantityKg: {
      type: Number,
      default: 0,
    },
    recoveredQuantityKg: {
      type: Number,
      default: 0,
    },
    landfillDivertedKg: {
      type: Number,
      default: 0,
    },
    processedAt: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const ProcessingRecord = mongoose.model('ProcessingRecord', processingRecordSchema);
export default ProcessingRecord;
