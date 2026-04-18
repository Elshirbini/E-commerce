import { Settings, SettingsDocument } from "./settings.schema";

export const getSetting = async () => {
  return Settings.findOne();
};

export const saveSettings = async (setting: SettingsDocument) => {
  return setting.save();
};
