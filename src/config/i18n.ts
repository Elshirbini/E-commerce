import i18n from "i18n";
import path from "path";

i18n.configure({
  locales: ["en", "ar"],
  defaultLocale: "ar",
  directory: path.join(__dirname, "../locales"), // مكان ملفات الترجمة
  header: "x-user-lang", // هيدر مخصص
  autoReload: true, // يحدث تلقائي لو الملفات اتعدلت
  syncFiles: true, // ينشئ keys ناقصة
  objectNotation: true, // دعم nested keys (اختياري)
});

export default i18n;
