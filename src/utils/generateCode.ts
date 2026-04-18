import crypto from "crypto";

export const generateReferralCode = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const bytes = crypto.randomBytes(9);
  let code = "";
  for (let i = 0; i < 9; i++) {
    code += chars[bytes[i] % chars.length];
  }
  return `${code}`;
};
