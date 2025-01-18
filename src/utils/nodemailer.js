import nodemailer from "nodemailer";
import { google } from "googleapis";

const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const redirectURI = process.env.REDIRECT_URI;
const refreshToken = process.env.REFRESH_TOKEN;
const sendersAddress = process.env.SENDERS_ADDRESS;


const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectURI);
oauth2Client.setCredentials({ refresh_token: refreshToken });

async function sendEmail(subject, content, email) {
    try {
        const accessToken = await oauth2Client.getAccessToken();

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                type: "OAuth2",
                user: sendersAddress,
                clientId,
                clientSecret,
                refreshToken,
                accessToken: accessToken.token
            }
        });

        const mailOptions = {
            from: `Sports Council - IIT Jammu <${sendersAddress}>`,
            to: email,
            subject,
            html: content // We will be sending a html template in emails
        }

        const result = await transporter.sendMail(mailOptions);

        console.log("Email sent successfully!! Message ID :", result.messageId);
    } catch (error) {
        console.log("Error while sending email E:", error);
    }
}