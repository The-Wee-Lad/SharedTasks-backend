import nodemailer from "nodemailer";
import ora from "ora";
import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
console.log(process.env.EMAIL_USER);

let zohoMail = {
    pool: process.env.EMAIL_POOL === "true",
    host: process.env.EMAIL_HOST,
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
};

let zohoDefaults = {
    from: `Shared-Task (no-reply) <${process.env.EMAIL_USER}>`,
    headers: {
        "X-Auto-Response-Suppress": "All",
        "Auto-Submitted": "auto-generated"
    }
}

let spinner = ora('Creating Transporter ... ').start();
let transporter = nodemailer.createTransport(zohoMail, zohoDefaults);
spinner.succeed('Transporter Created!');

const messageCreater = (to, subject, text, html, attachments, more = {}) => {
    return {
        to,
        subject,
        text,
        html,
        attachments,
        ...more
    };
}

const emailSender = async (message) => {
    try {
        let ready = await transporter.verify();
        if (!ready) {
            console.log("Transporter not ready");
            return;
        }
        let info = await transporter.sendMail(message);
        return {
            status: true,
            messageId: info.messageId,
            response: info.response,
            accepted: info.accepted,
            rejected: info.rejected,
            envelope: info.envelope
        }
    } catch (error) {
        return {
            status: false,
            error: error.message,
            stack: error.stack,
            code: error.code,
            response: error.response,
        }
    }
}


let emailSenderWrapper = async (to, subject, text, html, attachments) => {
    let message = messageCreater(to, subject, text, html, attachments, { replyTo: "no-reply@zohomail.in" });
    spinner.start('Sending Email ... ');
    let result = await emailSender(message);
    if (result.status) {
        spinner.succeed('Mail Sent! here is the result: ');
        console.log("Message ID: ", result.messageId);
        console.log("Response: ", result.response);
        console.log("Accepted: ", result.accepted);
        console.log("Rejected: ", result.rejected);
        console.log("Envelope: ", result.envelope);
    }
    else {
        spinner.fail('Failed to send email!');
        console.log("Error: ", result.error);
        console.log("Stack: ", result.stack);
        console.log("Code: ", result.code);
        console.log("Response: ", result.response);
    }
    console.log("Done!");
    transporter.close();
    return result.status
}


//emailSenderWrapper("tvoyluchshiydrug1@gmail.com", "SharedTask Email", "TEXT", "<h1>This is An Email from Shared-Task</h1>");

export { emailSenderWrapper as emailSender, messageCreater };
