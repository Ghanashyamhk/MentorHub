const nodemailer = require("nodemailer");

// ================= MAILTRAP SMTP =================

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: false,

    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// ================= SEND VERIFICATION EMAIL =================

const sendVerificationEmail = async (email, token) => {

    const verificationLink =
        `http://localhost:5000/api/auth/verify-email?token=${token}`;

    await transporter.sendMail({

        from: `"MentorHub" <${process.env.EMAIL_USER}>`,

        to: email,

        subject: "Verify your MentorHub account",

        html: `
            <h2>Welcome to MentorHub!</h2>

            <p>Thank you for registering.</p>

            <p>Please click the button below to verify your email:</p>

            <a href="${verificationLink}"
               style="
                 display:inline-block;
                 padding:12px 20px;
                 background:#4c6ef5;
                 color:white;
                 text-decoration:none;
                 border-radius:5px;
               ">
                Verify Email
            </a>

            <p>
                This verification link will expire in 10 minutes.
            </p>
        `
    });
};

// ================= TEST EMAIL CONNECTION =================

if (process.env.NODE_ENV !== "test") {

    transporter.verify((error, success) => {

        if (error) {

            console.log("EMAIL CONNECTION FAILED:");
            console.log(error);

        } else {

            console.log("EMAIL SERVER READY");

        }

    });

}

module.exports = sendVerificationEmail;