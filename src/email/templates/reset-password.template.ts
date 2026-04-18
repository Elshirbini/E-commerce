import { EmailTemplate } from "./email-template.interface";

export class ResetPasswordTemplate implements EmailTemplate {
  constructor(
    private readonly recipient: string,
    private readonly code: string,
  ) {}

  get to() {
    return this.recipient;
  }

  subject(): string {
    return "إعادة تعيين كلمة المرور – المتجر الإلكتروني";
  }

  html(): string {
    return `
  <div style="font-family: Arial, sans-serif; line-height: 1.8; max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; background-color: #ffffff; direction: rtl; text-align: right;">
    <h2 style="color: #222; text-align: center; margin-bottom: 20px;">إعادة تعيين كلمة المرور</h2>

    <p style="font-size: 16px; color: #444;">
      مرحبًا 👋، لقد طلبت إعادة تعيين كلمة المرور لحسابك على <strong>المنصة</strong>.
    </p>

    <p style="font-size: 16px; color: #444;">
      يرجى استخدام الرمز التالي لإكمال العملية:
    </p>

    <div style="text-align: center; margin: 25px 0;">
      <span style="display: inline-block; font-size: 28px; font-weight: bold; letter-spacing: 4px; color: #0d6efd;">${this.code}</span>
    </div>

    <p style="font-size: 14px; color: #777;">
      ⚠️ هذا الرمز صالح لمدة <strong>10 دقائق</strong> فقط. إذا لم تطلب إعادة التعيين، يمكنك تجاهل هذا البريد بأمان.
    </p>

    <hr style="margin: 25px 0; border: none; border-top: 1px solid #eee;" />

    <p style="font-size: 13px; color: #888; text-align: center;">
      دعم العملاء – <a href="#" style="color: #0d6efd; text-decoration: none;">زيارة المتجر</a><br/>
      للبريد والمساعدة: <a href="mailto:support@store.com" style="color: #0d6efd; text-decoration: none;">support@store.com</a>
    </p>
  </div>
  `;
  }
}
