import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Define WorkOrder Type
interface WorkOrder {
    id: number;
    client_name: string;
    service_description: string;
    hours_worked: number;
    hourly_rate: number;
    total_cost: number;
    status: string;
}

export async function POST(req: NextRequest) {
    const { workOrderId } = await req.json();

    // Load work orders
    const filePath = path.join(process.cwd(), "data", "workOrders.json");
    const fileContents = fs.readFileSync(filePath, "utf8");
    const workOrders: WorkOrder[] = JSON.parse(fileContents);  // ✅ Apply WorkOrder type

    // Find the specific work order
    const workOrder = workOrders.find((order: WorkOrder) => order.id === workOrderId);  // ✅ Explicit type

    if (!workOrder) {
        return NextResponse.json({ message: "Work Order Not Found" }, { status: 404 });
    }

    // Generate invoice
    const invoice = {
        invoice_id: `INV-${workOrder.id}`,
        client_name: workOrder.client_name,
        service_description: workOrder.service_description,
        amount_due: workOrder.total_cost,
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        hours_worked: workOrder.hours_worked,  // ✅ Added
        hourly_rate: workOrder.hourly_rate,    // ✅ Added
    };

    return NextResponse.json(invoice);
}

