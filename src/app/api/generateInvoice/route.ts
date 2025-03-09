import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Define WorkOrder and Invoice Type
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
    category: string;
    amount_due: number;
    due_date: string;
    hours_worked: number;
    hourly_rate: number;
}

// AI Function: Categorize Invoice Type
function categorizeInvoice(serviceDescription: string): string {
    if (serviceDescription.toLowerCase().includes("plumbing")) return "Maintenance";
    if (serviceDescription.toLowerCase().includes("electrical")) return "Repair";
    return "General Service";
}

export async function POST(req: NextRequest) {
    try {
        const { workOrderId } = await req.json();

        // Load work orders
        const filePath = path.join(process.cwd(), "data", "workOrders.json");
        const fileContents = fs.readFileSync(filePath, "utf8");
        const workOrders: WorkOrder[] = JSON.parse(fileContents); // ✅ Use defined type

        // Find the work order
        const workOrder = workOrders.find(order => order.id === workOrderId);

        if (!workOrder) {
            return NextResponse.json({ message: "Work Order Not Found" }, { status: 404 });
        }

        // Generate invoice with AI category
        const invoice: Invoice = {
            invoice_id: `INV-${workOrder.id}`,
            client_name: workOrder.client_name,
            service_description: workOrder.service_description,
            category: categorizeInvoice(workOrder.service_description), // AI Enhancement
            amount_due: workOrder.total_cost,
            due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 Days from Now
            hours_worked: workOrder.hours_worked,
            hourly_rate: workOrder.hourly_rate,
        };

        // Save invoice to storedInvoices.json
        const invoiceFilePath = path.join(process.cwd(), "data", "storedInvoices.json");
        let invoices: Invoice[] = [];

        if (fs.existsSync(invoiceFilePath)) {
            const invoiceData = fs.readFileSync(invoiceFilePath, "utf8");
            invoices = JSON.parse(invoiceData);
        }

        invoices.push(invoice);
        fs.writeFileSync(invoiceFilePath, JSON.stringify(invoices, null, 2));

        return NextResponse.json(invoice);
    } catch (error) {
        return NextResponse.json({ message: "Error generating invoice", error }, { status: 500 });
    }
}


