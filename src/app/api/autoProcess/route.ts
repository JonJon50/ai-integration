import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Define the response types
interface InvoiceResponse {
    status: "Success" | "Failure";
    message: string;
}

interface WorkOrder {
    id: number;
    client_name: string;
    service_description: string;
    hours_worked: number;
    hourly_rate: number;
    total_cost: number;
    status: string;
}

interface Invoice {
    invoice_id: string;
    client_name: string;
    service_description: string;
    amount_due: number;
    due_date: string;
    hours_worked: number;
    hourly_rate: number;
}

// Simulated functions for sending invoices
const sendToYardi = async (invoice: Invoice): Promise<InvoiceResponse> => {
    return new Promise((resolve) =>
        setTimeout(() => resolve({ status: "Success", message: `Invoice ${invoice.invoice_id} sent to Yardi` }), 2000)
    );
};

const sendToClient = async (invoice: Invoice): Promise<InvoiceResponse> => {
    return new Promise((resolve) =>
        setTimeout(() => resolve({ status: "Success", message: `Invoice ${invoice.invoice_id} emailed to client` }), 2000)
    );
};

export async function POST() {
    try {
        const filePath = path.join(process.cwd(), "data", "workOrders.json");
        const fileContents = fs.readFileSync(filePath, "utf8");
        const workOrders: WorkOrder[] = JSON.parse(fileContents);  // ✅ Ensure correct type

        // ✅ Filter for new work orders with correct type
        const newOrders = workOrders.filter((order: WorkOrder) => order.status === "new");

        if (newOrders.length === 0) {
            return NextResponse.json({ message: "New work orders to process." });
        }

        // ✅ Ensure we update the correct object inside workOrders
        newOrders.forEach((order) => {
            const index = workOrders.findIndex(o => o.id === order.id);
            if (index !== -1) workOrders[index].status = "processing";
        });

        for (const order of newOrders) {
            // Generate invoice
            const invoice: Invoice = {
                invoice_id: `INV-${order.id}`,
                client_name: order.client_name,
                service_description: order.service_description,
                amount_due: order.total_cost,
                due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                hours_worked: order.hours_worked,
                hourly_rate: order.hourly_rate
            };

            // Send to Yardi
            const yardiResponse: InvoiceResponse = await sendToYardi(invoice);

            // Send to Client
            const clientResponse: InvoiceResponse = await sendToClient(invoice);

            // ✅ Update status dynamically
            const index = workOrders.findIndex(o => o.id === order.id);
            if (index !== -1) {
                workOrders[index].status = yardiResponse.status === "Success" && clientResponse.status === "Success"
                    ? "processed"
                    : "failed";
            }
        }

        // Save updated work orders
        fs.writeFileSync(filePath, JSON.stringify(workOrders, null, 2), "utf8");

        return NextResponse.json({ message: "Work orders processed.", workOrders });
    } catch (error) {
        console.error("Error processing work orders:", error);
        return NextResponse.json({ message: "Failed to process work orders", error: String(error) }, { status: 500 });
    }
}
