import nodemailer from 'nodemailer'

const transporter  = nodemailer.createTransport({
      service: 'Gmail',
      auth:{
         user: process.env.SENDER_EMAIL,
         pass: process.env.SENDER_EMAIL_PASSWORD         
      },

});

transporter.verify((error, success) => {
  if (error) {
    console.error("❌ SMTP connection failed:", error);
  } else {
    console.log("✅ SMTP server is ready to take messages");
  }
});



export default transporter;