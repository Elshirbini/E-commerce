import { Schema, model, Document } from "mongoose";

interface CounterDocument extends Document {
  name: string;
  seq: number;
}

const counterSchema = new Schema<CounterDocument>({
  name: { type: String, required: true, unique: true },
  seq: { type: Number, default: 0 },
});

export const Counter = model<CounterDocument>("Counter", counterSchema);
