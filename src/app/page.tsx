"use client";
import { useEffect, useState } from "react";

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
}

export default function Home() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/workOrders")
      .then((res) => res.json())
      .then((data: WorkOrder[]) => setWorkOrders(data));
  }, []);

  const generateInvoice = async (workOrderId: number) => {
    setLoading(true);
    const res = await fetch("/api/generateInvoice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workOrderId }),
    });
    const data: Invoice = await res.json();
    setInvoice(data);
    setLoading(false);
  };

  const sendInvoice = async () => {
    if (!invoice) return alert("Generate an invoice first!");
    setLoading(true);
    const res = await fetch("/api/sendInvoice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_email: "client@example.com",
        invoice,
      }),
    });
    const result = await res.json();
    alert(result.message);
    setLoading(false);
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-3xl font-bold mb-6">Work Orders</h1>
      <table className="border-collapse border border-gray-300 w-full max-w-3xl">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Client</th>
            <th className="border p-2">Service</th>
            <th className="border p-2">Total Cost</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {workOrders.map((order) => (
            <tr key={order.id} className="border">
              <td className="border p-2">{order.client_name}</td>
              <td className="border p-2">{order.service_description}</td>
              <td className="border p-2">${order.total_cost}</td>
              <td className="border p-2">
                <button
                  className="bg-blue-500 text-white px-3 py-1 rounded mr-2"
                  onClick={() => generateInvoice(order.id)}
                  disabled={loading}
                >
                  Generate Invoice
                </button>
                <button
                  className="bg-green-500 text-white px-3 py-1 rounded"
                  onClick={sendInvoice}
                  disabled={!invoice || loading}
                >
                  Send Invoice
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {invoice && (
        <div className="mt-6 p-4 border rounded bg-white shadow-md w-full max-w-3xl text-black">
          <h2 className="text-xl font-bold">Generated Invoice</h2>
          <p><strong>Client:</strong> {invoice.client_name}</p>
          <p><strong>Service:</strong> {invoice.service_description}</p>
          <p><strong>Amount Due:</strong> ${invoice.amount_due}</p>
          <p><strong>Due Date:</strong> {new Date(invoice.due_date).toLocaleDateString()}</p>
        </div>
      )}

    </main>
  );
}
