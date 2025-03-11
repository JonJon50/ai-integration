"use client";
import { useState } from "react";
import { motion } from "framer-motion";

export default function ChatBot({ startAIProcessing }: { startAIProcessing: () => void }) {
    const [userInput, setUserInput] = useState("");
    const [chatHistory, setChatHistory] = useState<{ role: string; content: string }[]>([]);
    const [loading, setLoading] = useState(false);

    const sendMessage = async () => {
        if (!userInput.trim()) return;
        setLoading(true);

        const newChatHistory = [...chatHistory, { role: "user", content: userInput }];
        setChatHistory(newChatHistory);
        setUserInput("");

        try {
            let response;

            // ✅ Trigger AI Processing if user types "Start AI Processing"
            if (userInput.toLowerCase().includes("start ai processing")) {
                setChatHistory((prev) => [
                    ...prev,
                    { role: "assistant", content: "Starting AI Processing now..." },
                ]);
                startAIProcessing();
                setLoading(false);
                return;
            }

            // 🟢 Check if user is asking about an invoice (pattern: INV-123)
            const invoiceMatch = userInput.match(/INV-\d+/);
            if (invoiceMatch) {
                const invoiceId = invoiceMatch[0]; // Extract invoice ID

                response = await fetch("/api/getWorkOrderStatus", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ invoiceId }),
                });
            } else {
                // 🟢 Call webScrape API for all other queries (replacing OpenAI)
                response = await fetch(`/api/webScrape?url=${encodeURIComponent(userInput.trim())}`);
            }

            // ✅ Ensure response is valid before parsing
            if (!response.ok) {
                throw new Error(`API Error: ${response.status} - ${response.statusText}`);
            }

            const data = await response.json();
            setChatHistory((prev) => [
                ...prev,
                { role: "assistant", content: data.response || "Sorry, no relevant data was found." },
            ]);
        } catch (error) {
            console.error("Error:", error);

            // 🚀 Trigger AI Processing After Error Message If Scraping Fails
            setChatHistory((prev) => [
                ...prev,
                { role: "assistant", content: "Sorry, I couldn't process that request. But John instructed me to Start AI Processing. Starting NOW..." },
            ]);

            setTimeout(() => {
                startAIProcessing();
            }, 3000); // Wait 3 seconds before starting
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div className="fixed bottom-4 right-4 bg-gray-800 text-white p-4 rounded-lg shadow-lg w-80">
            <h2 className="text-lg font-bold">AI Chat Assistant</h2>
            <div className="h-48 overflow-y-auto p-2 border border-gray-700 rounded-md">
                {chatHistory.map((msg, index) => (
                    <p key={index} className={msg.role === "user" ? "text-blue-400" : "text-green-400"}>
                        <strong>{msg.role === "user" ? "You: " : "AI: "}</strong> {msg.content}
                    </p>
                ))}
            </div>
            <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Ask about a work order..."
                className="w-full p-2 rounded bg-gray-700 text-white mt-2"
            />
            <button
                onClick={sendMessage}
                className="w-full bg-blue-500 text-white mt-2 py-1 rounded disabled:bg-gray-500"
                disabled={loading}
            >
                {loading ? "Thinking..." : "Send"}
            </button>
        </motion.div>
    );
}















// 🚀 Trigger AI Processing After Error Message
// setChatHistory((prev) => [
//     ...prev,
//     { role: "assistant", content: "Sorry, I couldn't process that request because I'm not a paid version. But John instructed me to Start AI Processing. Starting NOW..." },
// ]);

// // 🔥 Start AI Processing after a delay (to simulate natural response time)
// setTimeout(() => {
//     startAIProcessing();
// }, 3000); // Wait 3 seconds before starting
//         } finally {
//     setLoading(false);
// }

// setUserInput("");
//     };
