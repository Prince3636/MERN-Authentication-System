import nodemailer from 'nodemailer'

const transporter  = nodemailer.createTransport({
      service: 'Gmail',
      auth:{
         user: process.env.SMTP_USER,
         pass: process.env.SMTP_PASS
         
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