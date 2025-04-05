import { transporter } from "./nodemailer"

export async function sendVerificationEmail(email: string, name: string, token: string) {
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`

  try {
    const info = await transporter.sendMail({
      from: `"Client Portal" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "Verify your email address",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Verify your email address</h2>
          <p>Hello ${name},</p>
          <p>Thank you for registering with Client Portal. Please verify your email address by clicking the button below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
              Verify Email
            </a>
          </div>
          <p>If you didn't create an account, you can safely ignore this email.</p>
          <p>This link will expire in 24 hours.</p>
          <p>Best regards,<br>The Client Portal Team</p>
        </div>
      `,
      text: `Hello ${name},\n\nThank you for registering with Client Portal. Please verify your email address by clicking the link below:\n\n${verificationUrl}\n\nIf you didn't create an account, you can safely ignore this email.\n\nThis link will expire in 24 hours.\n\nBest regards,\nThe Client Portal Team`,
    })

    console.log("Verification email sent:", info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error("Error sending verification email:", error)
    return { success: false, error }
  }
}

