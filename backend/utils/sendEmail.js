const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

const sendEmail = async (options) => {
  let transporter;

  const useRealSmtp =
    process.env.SMTP_HOST &&
    process.env.SMTP_PORT &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS;

  if (useRealSmtp) {
    console.log(`Attempting to use configured SMTP: ${process.env.SMTP_HOST}:${process.env.SMTP_PORT}`);
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT, 10),
      secure: process.env.SMTP_SECURE === 'true' || parseInt(process.env.SMTP_PORT, 10) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    console.log('--------------------------------------------------------------------');
    console.log('NOTICE: SMTP environment variables not fully configured.');
    console.log('Using Ethereal.email for testing. Emails will NOT be sent to real inboxes.');
    let testAccount = await nodemailer.createTestAccount();
    console.log('Ethereal Test Account Credentials (for this session):');
    console.log(`  User: ${testAccount.user}`);
    console.log(`  Pass: ${testAccount.pass}`);
    console.log('--------------------------------------------------------------------');

    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }

  const mailOptions = {
    from: `"${process.env.EMAIL_FROM_NAME || 'DevLink Platform'}" <${process.env.EMAIL_FROM_ADDRESS || 'noreply@devlink.com'}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sending process initiated. Message ID: ${info.messageId}`);

    if (transporter.options.host === 'smtp.ethereal.email' && info.messageId) {
      console.log(`Preview Ethereal email at: ${nodemailer.getTestMessageUrl(info)}`);
      console.log('--------------------------------------------------------------------');
    } else if (useRealSmtp) {
      console.log(`Email successfully queued for delivery to ${options.email} via ${process.env.SMTP_HOST}.`);
    }
    return info;
  } catch (error) {
    console.error('------------------- EMAIL SENDING FAILED -------------------');
    console.error(`Error Details: ${error.message}`);
    if (error.code) console.error(`Error Code: ${error.code}`);
    if (error.responseCode) console.error(`Response Code: ${error.responseCode}`);
    if (error.response) console.error(`Error Response: ${error.response}`);
    
    if (useRealSmtp && (error.code === 'EAUTH' || error.responseCode === 535)) {
        console.error('SMTP Authentication Failed: Please verify SMTP_USER and SMTP_PASS in your .env file.');
        console.error('If using Gmail with 2FA, ensure you are using an App Password.');
    } else if (useRealSmtp && error.code === 'ECONNECTION') {
        console.error('SMTP Connection Failed: Please verify SMTP_HOST and SMTP_PORT, and check firewall or network issues.');
    }
    console.error('--------------------------------------------------------------');
    throw new Error('Email could not be sent. Please check server logs for details.');
  }
};

module.exports = sendEmail;