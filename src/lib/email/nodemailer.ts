import  nodemailer  from 'nodemailer';


// Create a transporter using Gmail SMTP
export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    // You need to use an "App Password" if you have 2FA enabled
    // https://support.google.com/accounts/answer/185833
    pass: process.env.GMAIL_APP_PASSWORD,
  },
})


