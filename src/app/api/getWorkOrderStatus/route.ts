// getWorkOrderStatus/route.ts - API route
import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
    try {
        console.log("Received request at /api/getWorkOrderStatus");

        const { invoiceId } = await req.json();
        console.log("Parsed invoiceId:", invoiceId);

        if (!invoiceId) {
            console.log("❌ Missing invoice ID");
            return NextResponse.json({ message: "Invoice ID is required" }, { status: 400 });
        }

        // ✅ Read from the mock JSON database asynchronously
        const filePath = path.join(process.cwd(), "data", "workOrders.json");

        // ✅ Check if file exists
        try {
            await fs.access(filePath);
        } catch {
            console.log("❌ workOrders.json file not found");
            return NextResponse.json({ message: "Internal Server Error: workOrders.json missing" }, { status: 500 });
        }

        const fileContents = await fs.readFile(filePath, "utf8");
        const workOrders = JSON.parse(fileContents);

        console.log("Loaded work orders:", workOrders.length);

        // ✅ Find the work order by invoice ID
        interface WorkOrder {
            id: string;
            client_name: string;
            status: string;
            service_description: string;
        }

        const workOrder = workOrders.find((order: WorkOrder) => `INV-${order.id}` === invoiceId);

        if (!workOrder) {
            console.log("❌ Work order not found for:", invoiceId);
            return NextResponse.json({ message: "Work order not found" }, { status: 404 });
        }

        console.log("✅ Found work order:", workOrder);

        // ✅ Return the work order details
        return NextResponse.json({
            invoice_id: invoiceId,
            client_name: workOrder.client_name,
            status: workOrder.status,
            service_description: workOrder.service_description,
        });

    } catch (error) {
        console.error("Error fetching work order:", error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json({ message: "Internal Server Error", error: errorMessage }, { status: 500 });
    }
}
