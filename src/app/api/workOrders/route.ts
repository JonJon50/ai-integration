import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Define WorkOrder type
interface WorkOrder {
    id: number;
    client_name: string;
    service_description: string;
    hours_worked: number;
    hourly_rate: number;
    total_cost: number;
    status: string;
}

export async function GET() {
    try {
        const filePath = path.join(process.cwd(), "data", "workOrders.json");
        const fileContents = fs.readFileSync(filePath, "utf8");
        const workOrders: WorkOrder[] = JSON.parse(fileContents);

        return NextResponse.json(workOrders);
    } catch (error) {
        return NextResponse.json(
            { message: "Failed to load work orders", error },
            { status: 500 }
        );
    }
}

