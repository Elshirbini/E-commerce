import { Request, Response } from "express";
import { success } from "../utils/response";
import { ApiError } from "../utils/apiError";
import { getSetting, saveSettings } from "./settings.repository";

export const getSettings = async (req: Request, res: Response) => {
  const settings = await getSetting();
  return success(res, 200, null, settings);
};

export const updateSettings = async (req: Request, res: Response) => {
  const { enabledCurrencies } = req.body;

  const settings = await getSetting();
  if (!settings) {
    throw new ApiError(req.__("Settings not found"), 404);
  }

  settings.enabledCurrencies = enabledCurrencies;

  await saveSettings(settings);

  return success(res, 200, "Settings updated successfully");
};
