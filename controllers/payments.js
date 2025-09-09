const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const cors = require("cors")
const dotenv = require('dotenv');
dotenv.config();
const app = express();
app.use(bodyParser.json());
app.use(cors())

const payment = process.env.PAYSTACK_SECRET_KEY
const transporter = nodemailer.createTransport({
    service:'gmail',
    auth:{
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
})

const InitializePayment = async (req, res) => {
    const { email, amount } = req.body
    const params = {
        email: email,
        amount: amount * 100
    };
    const URL = "https://api.paystack.co/transaction/initialize";
    try {
        const response = await fetch(URL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${payment}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(params)
        });
        const data = await response.json();

        if (!data.status) { 
            return res.status(400).json({ message: data.message });
        }
    const mailOptions = {
    from: `"Payment System" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Complete Your Payment",
    html: `
        <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
            <h2 style="color: #0a6cf1;">Hello,</h2>
            <p>Thank you for choosing our service. A payment request has been initiated for the amount of <strong>₦${amount}</strong>.</p>
            
            <p>Please click the button below to complete your payment securely:</p>
            
            <a href="${data.data.authorization_url}" 
               style="display: inline-block; padding: 12px 24px; background-color: #0a6cf1; color: #fff; text-decoration: none; border-radius: 6px; font-weight: bold;">
                Complete Payment
            </a>
            
            <p>If the button above does not work, you can copy and paste the following link in your browser:</p>
            <p style="word-break: break-all;">${data.data.authorization_url}</p>
            
            <hr>
            <p style="font-size: 14px; color: #777;">If you did not initiate this transaction, please ignore this email.</p>
            <p style="font-size: 14px; color: #777;">Regards,<br>Payment Team</p>
        </div>
    `
};

        transporter.sendMail(mailOptions);
        return res.status(200).json({
            message: data.message,
            authorization_url: data.data.authorization_url,
            reference: data.data.reference
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server error" });
    }
};

const VerifyPayment = async (req, res) => {
    const { reference } = req.params;
    const URL = `https://api.paystack.co/transaction/verify/${reference}`;

    try {
        const response = await fetch(URL, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${payment}`,
                "Content-Type": "application/json"
            }
        });
        const data = await response.json();

        if (!data.status) {
            return res.status(400).json({ message: data.message });
        }

        const amount = data.data.amount / 100;
        const userEmail = data.data.customer.email;
        const status = data.data.status;

        let mailOptions = {
    from: `"Payment System" <${process.env.EMAIL_USER}>`,
    to: "owner@example.com", // clients email goes here
    subject: "New Payment Received",
    html: `
        <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
            <h2 style="color: #28a745;">Payment Confirmation</h2>
            
            <p>Hello,</p>
            <p>A new payment has been received with the following details:</p>
            
            <table style="width: 100%; border-collapse: collapse;">
                <tr>
                    <td style="padding: 8px; border: 1px solid #ddd;"><strong>Amount:</strong></td>
                    <td style="padding: 8px; border: 1px solid #ddd;">₦${amount}</td>
                </tr>
                <tr>
                    <td style="padding: 8px; border: 1px solid #ddd;"><strong>Customer Email:</strong></td>
                    <td style="padding: 8px; border: 1px solid #ddd;">${userEmail}</td>
                </tr>
                <tr>
                    <td style="padding: 8px; border: 1px solid #ddd;"><strong>Transaction Reference:</strong></td>
                    <td style="padding: 8px; border: 1px solid #ddd;">${reference}</td>
                </tr>
                <tr>
                    <td style="padding: 8px; border: 1px solid #ddd;"><strong>Status:</strong></td>
                    <td style="padding: 8px; border: 1px solid #ddd;">${status}</td>
                </tr>
            </table>
            
            <p style="margin-top: 20px;">You can verify this transaction in your <a href="https://dashboard.paystack.com" style="color: #0a6cf1;">Paystack Dashboard</a>.</p>
            
            <hr>
            <p style="font-size: 14px; color: #777;">This is an automated notification from your payment system.</p>
        </div>
    `
};


        await transporter.sendMail(mailOptions);

        return res.status(200).json({
            message: data.message,
            amount,
            email: userEmail,
            reference: data.data.reference,
            status: data.data.status
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server error" });
    }
};

module.exports =
{
InitializePayment,
VerifyPayment
}