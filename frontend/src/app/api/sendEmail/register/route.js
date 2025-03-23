"use strict";
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

const mainMail = "tucorreo@ejemplo.com";
const currentDate = new Date().toString();

export async function POST(request) {
  try {
    const { username, email, password, birthDate } = await request.json();

    const safeBirthDate = birthDate || "Not provided";

    const transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOption = {
      from: mainMail,
      to: mainMail,
      subject: `Email sent by: ${username}`,
      html: `
        <div style="background-color: #f5f5f5; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #fff; padding: 20px; border-radius: 10px; box-shadow: 0px 0px 10px rgba(0,0,0,0.2);">
            <h1>Details of Mail</h1>
            <table>
              <tr><td><strong>Name: ${username}</strong></td></tr>
              <tr><td><strong>Password: ${password}</strong></td></tr>
              <tr><td><strong>Email: ${email}</strong></td></tr>
              <tr><td><strong>Birthdate: ${safeBirthDate}</strong></td></tr>
              <tr><td><strong>Registered schedule: ${currentDate}</strong></td></tr>
            </table>
            <hr style="border-color: #18A14F; border-width: 1px; margin: 20px 0;">
          </div>
          <p style="padding:10px;"><strong>Mail generated by:</strong> ${mainMail}</p>
        </div>
      `,
    };

    const mailSent = {
      from: mainMail,
      to: email,
      subject: `Welcome to OrganiZapp: ${username} !🙂¡`,
      html: `
        <div style="background-color: #f5f5f5; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #fff; padding: 20px; border-radius: 10px; box-shadow: 0px 0px 10px rgba(0,0,0,0.2);">
            <h1>Details of Register</h1>
            <table>
              <tr><td><strong>Hello: ${username}!</strong></td></tr>
              <tr><td>This is our account Details:</td></tr>
              <tr><td><strong>Your email registered: ${email}</strong></td></tr>
              <tr><td><strong>Birthdate: ${safeBirthDate}</strong></td></tr>
              <tr><td><strong>Registered schedule: ${currentDate}</strong></td></tr>
            </table>
            <hr style="border-color: #18A14F; border-width: 1px; margin: 20px 0;">
          </div>
          <p style="padding:10px;"><strong>Mail generated by:</strong> ${mainMail}</p>
        </div>
      `,
    };

    try {
      await transporter.sendMail(mailOption);
    } catch (error) {
      console.error("Error sending admin email:", error);
    }

    try {
      await transporter.sendMail(mailSent);
    } catch (error) {
      console.error("Error sending user email:", error);
    }

    return NextResponse.json(
      { message: "Email Sent Successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { message: "Failed to Send Email" },
      { status: 500 },
    );
  }
}
