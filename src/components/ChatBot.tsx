"use client";
import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";

export default function ChatBot({ startAIProcessing }: { startAIProcessing: () => void }) {
    const [userInput, setUserInput] = useState("");
    const [chatHistory, setChatHistory] = useState<{ role: string; content: string }[]>([]);
    const [loading, setLoading] = useState(false);
    const [showChat, setShowChat] = useState(false); // ✅ Controls when chat appears

    // ✅ Show chatbot with a delay when page loads
    useEffect(() => {
        const timer = setTimeout(() => {
            setShowChat(true);
            setChatHistory([{ role: "assistant", content: "Hello! How can I assist you today?" }]); // ✅ Greeting message
        }, 3000); // 3-second delay

        return () => clearTimeout(timer); // Cleanup on unmount
    }, []);

    const sendMessage = useCallback(async () => {
        if (!userInput.trim() || loading) return;
        setLoading(true);

        const newChatHistory = [...chatHistory, { role: "user", content: userInput }];
        setChatHistory(newChatHistory);
        setUserInput("");

        try {
            let response;

            // ✅ Trigger AI Processing if exact phrase is detected
            if (userInput.trim().toLowerCase() === "start ai processing") {
                setChatHistory((prev) => [...prev, { role: "assistant", content: "Starting AI Processing now..." }]);
                startAIProcessing();
                return;
            }

            // 🟢 Check if user asks about an invoice (format: INV-123)
            const invoiceMatch = userInput.match(/INV-\d+/);
            if (invoiceMatch) {
                response = await fetch("/api/getWorkOrderStatus", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ invoiceId: invoiceMatch[0] }),
                });
            } else {
                // 🟢 Call webScrape API for general queries
                response = await fetch(`/api/webScrape?url=${encodeURIComponent(userInput.trim())}`);
            }

            if (!response.ok) throw new Error(`API Error: ${response.status} - ${response.statusText}`);

            const data = await response.json();
            setChatHistory((prev) => [...prev, { role: "assistant", content: data.response || "No relevant data found." }]);
        } catch (error) {
            console.error("Error:", error);

            // 🚀 More professional error message & AI Processing trigger
            setChatHistory((prev) => [
                ...prev,
                {
                    role: "assistant",
                    content: "Thanks for the response, I'm unable to retrieve that information at the moment. However, I can start the AI processing to assist you. Please hold...",
                },
            ]);

            setTimeout(startAIProcessing, 3000);
        } finally {
            setLoading(false);
        }
    }, [userInput, loading, chatHistory, startAIProcessing]);

    return (
        <>
            {showChat && ( // ✅ Only show chat after delay
                <motion.div
                    className="fixed bottom-4 right-4 bg-gray-800 text-white p-4 rounded-lg shadow-lg w-80"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
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
                        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                        placeholder="Ask about a work order..."
                        className="w-full p-2 rounded bg-gray-700 text-white mt-2"
                        disabled={loading}
                    />
                    <button
                        onClick={sendMessage}
                        className="w-full bg-blue-500 text-white mt-2 py-1 rounded disabled:bg-gray-500"
                        disabled={loading}
                    >
                        {loading ? "Thinking..." : "Send"}
                    </button>
                </motion.div>
            )}
        </>
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
