import { HydratedDocument, InferSchemaType, model, Schema } from "mongoose";

const settingsSchema = new Schema({
  enabledCurrencies: {
    type: [String],
    default: ["usd"],
  },
});

type Settings = InferSchemaType<typeof settingsSchema>;
export type SettingsDocument = HydratedDocument<Settings>;

export const Settings = model("Settings", settingsSchema);
