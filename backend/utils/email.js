const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
      }
    });

    console.log(`Attempting to send email to: ${options.email} from: ${process.env.GMAIL_USER}`);

    const mailOptions = {
      from: `"Review Guard" <${process.env.GMAIL_USER}>`,
      to: options.email,
      subject: options.subject,
      html: options.html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
  } catch (error) {
    console.error('NODEMAILER ERROR:', error);
    throw error;
  }
};

module.exports = sendEmail;
