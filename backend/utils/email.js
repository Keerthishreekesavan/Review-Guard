const axios = require('axios');

const sendEmail = async (options) => {
  console.log('--- EMAIL SERVICE START ---');
  console.log('Recipient:', options.email);
  console.log('Subject:', options.subject);
  console.log('BREVO_API_KEY exists:', !!process.env.BREVO_API_KEY);
  console.log('GMAIL_USER exists:', !!process.env.GMAIL_USER);

  try {
    // If we have a Brevo API Key, use the API (Best for Render/Production)
    if (process.env.BREVO_API_KEY) {
      console.log('CHOICE: Using Brevo API');
      
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

      console.log('SUCCESS: Email sent via Brevo API ID:', response.data.messageId);
      return;
    }

    // FALLBACK: Gmail SMTP (For local testing)
    console.log('CHOICE: Falling back to Gmail SMTP');
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: `"Review Guard" <${process.env.GMAIL_USER}>`,
      to: options.email,
      subject: options.subject,
      html: options.html
    });
    console.log('SUCCESS: Email sent via Gmail SMTP');
  } catch (error) {
    console.error('--- EMAIL SERVICE FAILED ---');
    console.error('ERROR DETAILS:', error.response?.data || error.message);
    throw error;
  }
};

module.exports = sendEmail;
