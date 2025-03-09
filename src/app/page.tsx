"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion"; // ✅ Import Framer Motion

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

export default function Home() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(false);
  const [emailPreview, setEmailPreview] = useState<string | null>(null);
  const [yardiResponse, setYardiResponse] = useState(null);

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

  const sendInvoiceToYardi = async () => {
    if (!invoice) return alert("Generate an invoice first!");
    setLoading(true);

    try {
      const res = await fetch("/api/yardiMock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoice }),
      });

      if (!res.ok) throw new Error("Failed to send invoice to Yardi");

      const result = await res.json();
      alert(result.message);
      setYardiResponse(result);
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to send invoice. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  const sendInvoice = async () => {
    if (!invoice) return alert("Generate an invoice first!");
    setLoading(true);

    const emailContent = `
      Dear ${invoice.client_name},

      Here is your invoice for ${invoice.service_description}.
      Amount Due: $${invoice.amount_due}

      Due Date: ${invoice.due_date}

      Thank you!
    `;

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
                  className="bg-blue-500 text-white px-3 py-1 rounded"
                  onClick={() => generateInvoice(order.id)}
                  disabled={loading}
                >
                  Generate Invoice
                </button>
                <button
                  className="bg-purple-500 text-white px-3 py-1 rounded mx-2"
                  onClick={sendInvoiceToYardi}
                  disabled={!invoice || loading}
                >
                  Send to Yardi
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

      {/* Display Invoice First */}
      {invoice && (
        <motion.div
          className="mt-6 p-4 border rounded bg-black-100 w-full max-w-3xl"
          initial={{ opacity: 0, y: -20 }} // Start invisible, slightly above
          animate={{ opacity: 1, y: 0 }} // Animate to visible
          transition={{ duration: 0.5 }} // Smooth animation
        >
          <h2 className="text-xl font-bold">Generated Invoice</h2>
          <p><strong>Client:</strong> {invoice.client_name}</p>
          <p><strong>Service:</strong> {invoice.service_description}</p>
          <p><strong>Amount Due:</strong> ${invoice.amount_due}</p>
          <p><strong>Due Date:</strong> {invoice.due_date}</p>
        </motion.div>
      )}

      {/* Display Yardi Response Second */}
      {yardiResponse && (
        <motion.div
          className="mt-6 p-4 border rounded bg-black-100 w-full max-w-3xl"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }} // Delayed fade-in
        >
          <h2 className="text-xl font-bold">Yardi Response</h2>
          <pre className="whitespace-pre-wrap">{JSON.stringify(yardiResponse, null, 2)}</pre>
        </motion.div>
      )}

      {/* Display Email Preview Last */}
      {emailPreview && (
        <motion.div
          className="mt-6 p-6 border rounded-lg bg-black shadow-lg w-full max-w-3xl"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }} // Extra delay for smooth sequence
        >
          <h2 className="text-xl font-bold text-white mb-4 border-b pb-2">Generated Email</h2>

          <div className="p-4 border border-gray-300 bg-black-50 rounded">
            <p className="text-lg font-semibold">
              Dear <span className="text-blue-600">{invoice?.client_name}</span>,
            </p>
            <p>Here is your invoice for <strong>{invoice?.service_description}</strong>.</p>
          </div>

          <div className="mt-4 p-4 border border-gray-400 bg-black-100">
            <h3 className="text-lg font-semibold mb-2">Work Completed:</h3>
            <p><strong>Hours Worked:</strong> {invoice?.hours_worked} hrs</p>
            <p><strong>Hourly Rate:</strong> ${invoice?.hourly_rate}/hr</p>
            <p><strong>Total Cost:</strong> <span className="text-red-600">${invoice?.amount_due}</span></p>
            <p><strong>Due Date:</strong> {invoice?.due_date ? new Date(invoice.due_date).toLocaleDateString() : "N/A"}</p>
          </div>

          <p className="mt-4">Thank you for your business!</p>
          <p className="text-gray-500 text-sm mt-2">If you have any questions, please contact us.</p>
        </motion.div>
      )}

    </main>
  );
}

// John's Notes:
// - The `Home` component is the main page component that displays a list of work orders.
// - It fetches work orders from the API and displays them in a table.
// - It also has buttons to generate an invoice, send the invoice to Yardi, and send the invoice via email.
// - The `generateInvoice`, `sendInvoiceToYardi`, and `sendInvoice` functions handle the API calls.
// - The component uses local state to manage the work orders, invoice, loading state, email preview, and Yardi response.
// - The component conditionally renders the invoice, Yardi response, and email preview based on the state.