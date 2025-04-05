import { transporter } from "./nodemailer"

export async function sendPasswordResetEmail(email: string, name: string | null, token: string) {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`

  try {
    const info = await transporter.sendMail({
      from: `"Client Portal" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "Reset your password",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Reset your password</h2>
          <p>Hello ${name || "there"},</p>
          <p>We received a request to reset your password. Click the button below to create a new password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
              Reset Password
            </a>
          </div>
          <p>If you didn't request a password reset, you can safely ignore this email.</p>
          <p>This link will expire in 1 hour.</p>
          <p>Best regards,<br>The Client Portal Team</p>
        </div>
      `,
      text: `Hello ${name || "there"},\n\nWe received a request to reset your password. Click the link below to create a new password:\n\n${resetUrl}\n\nIf you didn't request a password reset, you can safely ignore this email.\n\nThis link will expire in 1 hour.\n\nBest regards,\nThe Client Portal Team`,
    })

    console.log("Password reset email sent:", info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error("Error sending password reset email:", error)
    return { success: false, error }
  }
}

