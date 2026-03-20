import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // true for 465, false for 587
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
});

export const sendMail = async (to: string, subject: string, html: string) => {
  try {
    const info = await transporter.sendMail({
      from: `"Snapcart" <${process.env.EMAIL}>`,
      to,
      subject,
      html,
    });

    console.log(" Email sent:", info.messageId);
    return info;
  } catch (error) {
    console.error(" Email error:", error);
    throw error;
  }
};
