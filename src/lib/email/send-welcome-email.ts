import { transporter } from "./nodemailer"

export async function sendWelcomeEmail(email: string, name: string) {
  try {
    const info = await transporter.sendMail({
      from: `"Client Portal" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "Welcome to Client Portal!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to Client Portal!</h2>
          <p>Hello ${name},</p>
          <p>Thank you for verifying your email address. Your account is now fully activated.</p>
          <p>You can now log in to your account and start using our services.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/login" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
              Log In
            </a>
          </div>
          <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
          <p>Best regards,<br>The Client Portal Team</p>
        </div>
      `,
      text: `Hello ${name},\n\nThank you for verifying your email address. Your account is now fully activated.\n\nYou can now log in to your account and start using our services.\n\n${process.env.NEXT_PUBLIC_APP_URL}/login\n\nIf you have any questions or need assistance, please don't hesitate to contact our support team.\n\nBest regards,\nThe Client Portal Team`,
    })

    console.log("Welcome email sent:", info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error("Error sending welcome email:", error)
    return { success: false, error }
  }
}

