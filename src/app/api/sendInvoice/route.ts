import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
    const { client_email, invoice } = await req.json();

    // Configure email transport
    const transporter = nodemailer.createTransport({
        service: "Gmail", // Change to SMTP for production
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: client_email,
        subject: `Invoice ${invoice.invoice_id}`,
        text: `Dear ${invoice.client_name},\n\nHere is your invoice for ${invoice.service_description}. Amount Due: $${invoice.amount_due}.\n\nDue Date: ${invoice.due_date}\n\nThank you!`,
    };

    try {
        await transporter.sendMail(mailOptions);
        return NextResponse.json({ message: "Invoice Sent Successfully!" });
    } catch (error) {
        return NextResponse.json({ message: "Failed to send invoice", error }, { status: 500 });
    }
}
