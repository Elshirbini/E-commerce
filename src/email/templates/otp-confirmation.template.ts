import { EmailTemplate } from "./email-template.interface";

export class OtpConfirmationTemplate implements EmailTemplate {
  constructor(
    private readonly recipient: string,
    private readonly otp: string,
  ) {}

  get to() {
    return this.recipient;
  }

  subject(): string {
    return "🔐 تأكيد الحساب – رمز التحقق الخاص بك";
  }

  html(): string {
    return `
    <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
      <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); direction: rtl; text-align: right;">
        <h2 style="color: #333;">مرحبا بك في <span style="color:#007bff;">متجرنا</span></h2>
        <p style="font-size: 16px; color: #555;">
          شكرًا لتسجيلك معنا! لإكمال عملية إنشاء حسابك، يرجى استخدام رمز التحقق (OTP) أدناه:
        </p>
        <div style="text-align: center; margin: 20px 0;">
          <span style="font-size: 28px; font-weight: bold; letter-spacing: 4px; color: #007bff;">${this.otp}</span>
        </div>
        <p style="font-size: 14px; color: #999;">
          ⚠️ هذا الرمز صالح لمدة <strong>10 دقائق فقط</strong>. إذا لم تكن أنت من طلب التسجيل، يمكنك تجاهل هذا البريد الإلكتروني.
        </p>
        <p style="font-size: 14px; color: #555; margin-top: 20px;">
          مع تحيات فريق <strong>الدعم الفني</strong> 💙
        </p>
      </div>
    </div>
    `;
  }
}
