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
  hours_worked: number;   // ✅ Added
  hourly_rate: number;    // ✅ Added
}


export default function Home() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(false);
  const [emailPreview, setEmailPreview] = useState<string | null>(null);

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

    // Generate Email Content for Preview
    const emailContent = `
      Dear ${invoice.client_name},

      Here is your invoice for ${invoice.service_description}.
      Amount Due: $${invoice.amount_due}

      Due Date: ${invoice.due_date}

      Thank you!
    `;

    // Set email preview on the screen
    setEmailPreview(emailContent);

    try {
      const res = await fetch("/api/sendInvoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_email: process.env.NEXT_PUBLIC_EMAIL_RECIPIENT,
          invoice,
        }),
      });

      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);

      const result = await res.json();
      alert(result.message);
    } catch (error) {
      console.error("Error sending invoice:", error);
      alert("Failed to send invoice. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-3xl font-bold mb-6">Work Orders</h1>
      <table className="border-collapse border border-gray-300 w-full max-w-3xl">
        <thead>
          <tr className="bg-black-100">
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
        <div className="mt-6 p-4 border rounded bg-black-100 w-full max-w-3xl">
          <h2 className="text-xl font-bold">Generated Invoice</h2>
          <p><strong>Client:</strong> {invoice.client_name}</p>
          <p><strong>Service:</strong> {invoice.service_description}</p>
          <p><strong>Amount Due:</strong> ${invoice.amount_due}</p>
          <p><strong>Due Date:</strong> {invoice.due_date}</p>
        </div>
      )}

      {emailPreview && (
        <div className="mt-6 p-6 border rounded-lg bg-black shadow-lg w-full max-w-3xl">
          <h2 className="text-xl font-bold text-white mb-4 border-b pb-2">Generated Email</h2>

          <div className="p-4 border border-gray-300 bg-black-50 rounded">
            <p className="text-lg font-semibold">
              Dear <span className="text-blue-600">{invoice?.client_name}</span>,
            </p>
            <p>Here is your invoice for <strong>{invoice?.service_description}</strong>.</p>
          </div>

          {/* Work Denomination Breakdown */}
          <div className="mt-4 p-4 border border-gray-400 bg-black-100">
            <h3 className="text-lg font-semibold mb-2">Work Completed:</h3>
            <p><strong>Hours Worked:</strong> {invoice?.hours_worked} hrs</p>
            <p><strong>Hourly Rate:</strong> ${invoice?.hourly_rate}/hr</p>
            <p><strong>Total Cost:</strong> <span className="text-red-600">${invoice?.amount_due}</span></p>
            <p><strong>Due Date:</strong> {invoice?.due_date ? new Date(invoice.due_date).toLocaleDateString() : "N/A"}</p>
          </div>

          <p className="mt-4">Thank you for your business!</p>
          <p className="text-gray-500 text-sm mt-2">If you have any questions, please contact us.</p>
        </div>
      )}





    </main>
  );
}
