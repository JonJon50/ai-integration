import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(req: NextRequest) {
    try {
        const { client_email, invoice } = await req.json();

        if (!invoice) {
            return NextResponse.json({ message: "Invoice data missing" }, { status: 400 });
        }

        // Define the file path for storing emails
        const filePath = path.join(process.cwd(), "data", "storedInvoices.json");

        // Read existing invoices or initialize an empty array
        let invoices = [];
        if (fs.existsSync(filePath)) {
            const fileData = fs.readFileSync(filePath, "utf8");
            invoices = JSON.parse(fileData);
        }

        // Generate email content
        const emailContent = {
            client_email,
            invoice_id: invoice.invoice_id,
            client_name: invoice.client_name,
            service_description: invoice.service_description,
            amount_due: invoice.amount_due,
            due_date: invoice.due_date,
            timestamp: new Date().toISOString(),
        };

        // Append new invoice to the list
        invoices.push(emailContent);

        // Save back to the JSON file
        fs.writeFileSync(filePath, JSON.stringify(invoices, null, 2), "utf8");

        return NextResponse.json({ message: "Invoice stored successfully and email sent to client!", emailContent });
    } catch (error) {
        console.error("Error saving invoice:", error);
        return NextResponse.json({ message: "Failed to store invoice", error: String(error) }, { status: 500 });
    }
}
