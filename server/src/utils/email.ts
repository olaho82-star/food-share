import nodemailer from 'nodemailer';

export async function sendPasswordResetEmail(to: string, token: string) {
  const resetUrl = `foodshare://reset-password?token=${token}`;

  const transporter = nodemailer.createTransport({
    service: 'SendGrid',
    auth: {
      user: 'apikey',
      pass: process.env.SENDGRID_API_KEY,
    },
  });

  await transporter.sendMail({
    from: process.env.FROM_EMAIL,
    to,
    subject: 'Reset your FoodShare password',
    html: `
      <p>Hi,</p>
      <p>We received a request to reset your FoodShare password.</p>
      <p><a href="${resetUrl}">Tap here to reset your password</a></p>
      <p>This link expires in 1 hour. If you didn't request this, you can safely ignore this email.</p>
      <p>— The FoodShare team</p>
    `,
  });
}
