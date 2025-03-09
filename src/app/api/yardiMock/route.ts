import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(req: NextRequest) {
    const { invoice } = await req.json();

    // Simulate an API processing delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Simulated response from Yardi
    const fakeResponse = {
        status: "Success",
        message: `Invoice ${invoice.invoice_id} has been received and processed by Yardi.`,
        timestamp: new Date().toISOString(),
    };

    // Save the invoice to a mock database (JSON file)
    const filePath = path.join(process.cwd(), "data", "yardiInvoices.json");
    let invoices = [];

    if (fs.existsSync(filePath)) {
        const fileData = fs.readFileSync(filePath, "utf8");
        invoices = JSON.parse(fileData);
    }

    invoices.push(invoice);
    fs.writeFileSync(filePath, JSON.stringify(invoices, null, 2));

    return NextResponse.json(fakeResponse);
}
