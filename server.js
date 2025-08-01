require("dotenv").config();
const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");

const app = express();

app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://farmingexpertsnetwork.co.uk/",
  ]
}));
app.use(express.json());

// ✅ Root route
app.get("/", (req, res) => {
  res.send("✅ Email server is running for both contact and join forms.");
});

// ✅ 🔗 JOIN US FORM
app.post("/api/send-email", async (req, res) => {
  const {
    fullName,
    email,
    phone,
    gender,
    occupation,
    region,
    interest,
    howHeard,
    message
  } = req.body;

  if (!fullName || !email || !interest || !message) {
    return res.status(400).json({ success: false, message: "Missing required fields." });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT),
      secure: process.env.EMAIL_SECURE === "true",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const businessMailOptions = {
      from: `"${fullName}" <${email}>`,
      to: "info@farmingexpertsnetwork.co.uk",
      subject: `🚜 New ${interest} Registration`,
      text: `
Join Us Form Submission:

Name: ${fullName}
Email: ${email}
Phone: ${phone}
Gender: ${gender}
Occupation: ${occupation}
Region: ${region}
Interest: ${interest}
How They Heard: ${howHeard}

Message:
${message}
      `,
    };

    const confirmationMailOptions = {
      from: `"FARMING EXPERTS" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "✅ Thank you for registering",
      text: `Hello ${fullName},

Thank you for registering as a ${interest} with Farming Experts.

We received your message:
"${message}"

We’ll get back to you soon.

– Farming Experts Team`,
    };

    await Promise.all([
      transporter.sendMail(businessMailOptions),
      transporter.sendMail(confirmationMailOptions),
    ]);

    return res.status(200).json({
      success: true,
      message: "Registration email sent successfully!",
    });

  } catch (err) {
    console.error("Join Us form error:", err);
    return res.status(500).json({ success: false, message: "Failed to send email." });
  }
});

// ✅ 📩 CONTACT US FORM
app.post("/api/contact", async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ success: false, message: "All fields are required." });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT),
      secure: process.env.EMAIL_SECURE === "true",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"${name}" <${email}>`,
      to: "info@farmingexpertsnetwork.co.uk",
      subject: `📩 Contact Form: ${subject}`,
      text: `
Contact Form Submission:

Name: ${name}
Email: ${email}
Subject: ${subject}

Message:
${message}
      `,
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({
      success: true,
      message: "Message sent successfully!",
    });

  } catch (err) {
    console.error("Contact form error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to send message.",
    });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
