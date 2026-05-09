const axios = require('axios');

const sendEmail = async (options) => {
  try {
    // If we have a Brevo API Key, use the API (Best for Render/Production)
    if (process.env.BREVO_API_KEY) {
      console.log(`Using Brevo API to send email to: ${options.email}`);
      
      const response = await axios.post('https://api.brevo.com/v3/smtp/email', {
        sender: { name: 'Review Guard', email: process.env.GMAIL_USER },
        to: [{ email: options.email }],
        subject: options.subject,
        htmlContent: options.html
      }, {
        headers: {
          'api-key': process.env.BREVO_API_KEY,
          'Content-Type': 'application/json'
        }
      });

      console.log('Email sent via Brevo API:', response.data.messageId);
      return;
    }

    // FALLBACK: Gmail SMTP (For local testing)
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
      }
    });

    const mailOptions = {
      from: `"Review Guard" <${process.env.GMAIL_USER}>`,
      to: options.email,
      subject: options.subject,
      html: options.html
    };

    await transporter.sendMail(mailOptions);
    console.log('Email sent via Gmail SMTP');
  } catch (error) {
    console.error('EMAIL ERROR:', error.response?.data || error.message);
    throw error;
  }
};

module.exports = sendEmail;
