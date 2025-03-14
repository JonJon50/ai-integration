"use client";
import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { X, Bot } from "lucide-react"; // 🟢 Icons for UI

export default function ChatBot({ startAIProcessing }: { startAIProcessing: () => void }) {
    const [userInput, setUserInput] = useState("");
    const [chatHistory, setChatHistory] = useState<{ role: string; content: string }[]>([]);
    const [loading, setLoading] = useState(false);
    const [showChat, setShowChat] = useState(false);

    // ✅ Auto-open chatbot after 3 seconds (Only on Desktop)
    useEffect(() => {
        const isMobile = window.innerWidth <= 640; // Mobile check
        if (!isMobile) {
            const timer = setTimeout(() => {
                setShowChat(true);
                setChatHistory([{ role: "assistant", content: "Hello! How can I assist you today?" }]);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, []);

    const sendMessage = useCallback(async () => {
        if (!userInput.trim() || loading) return;
        setLoading(true);

        const newChatHistory = [...chatHistory, { role: "user", content: userInput }];
        setChatHistory(newChatHistory);
        setUserInput("");

        try {
            let response;
            const userMessage = userInput.trim().toLowerCase();

            // ✅ Trigger AI Processing if "start" is typed
            if (userMessage === "start") {
                setChatHistory((prev) => [...prev, { role: "assistant", content: "Starting AI Processing now..." }]);
                startAIProcessing();
                return;
            }

            // 🟢 Check if user asks about an invoice (format: INV-123)
            const invoiceMatch = userMessage.match(/inv-\d+/);
            if (invoiceMatch) {
                response = await fetch("/api/getWorkOrderStatus", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ invoiceId: invoiceMatch[0] }),
                });
            } else {
                // 🟢 Call webScrape API for general queries
                response = await fetch(`/api/webScrape?url=${encodeURIComponent(userMessage)}`);
            }

            if (!response.ok) throw new Error(`API Error: ${response.status} - ${response.statusText}`);

            const data = await response.json();
            setChatHistory((prev) => [...prev, { role: "assistant", content: data.response || "No relevant data found." }]);
        } catch (error) {
            console.error("Error:", error);

            // 🚀 More professional error message & AI Processing trigger
            setChatHistory((prev) => [
                ...prev,
                { role: "assistant", content: "I'm unable to retrieve that information at the moment. However, I can start the AI processing to assist you. Please hold..." }
            ]);

            setTimeout(startAIProcessing, 3000);
        } finally {
            setLoading(false);
        }
    }, [userInput, loading, chatHistory, startAIProcessing]);

    return (
        <>
            {/* Floating AI Chat Icon */}
            {!showChat && (
                <motion.button
                    onClick={() => setShowChat(true)}
                    className="fixed bottom-4 right-4 bg-blue-500 text-white p-3 rounded-full shadow-lg flex items-center justify-center hover:bg-blue-600"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                >
                    <Bot size={24} />
                </motion.button>
            )}

            {/* Chatbot Window */}
            {showChat && (
                <motion.div
                    className="fixed bottom-4 right-4 bg-gray-800 text-white p-4 rounded-lg shadow-lg w-80 max-w-full sm:w-96 flex flex-col"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    {/* Header with AI Face & Close Button */}
                    <div className="flex items-center justify-between px-2 py-1 border-b border-gray-700">
                        {/* AI Face & Title */}
                        <div className="flex items-center space-x-2">
                            <Bot size={30} className="text-blue-400 sm:size-22" /> {/* AI Face */}
                            <h2 className="text-sm sm:text-lg font-bold">AI Chat Assistant</h2>
                        </div>

                        {/* Close Button */}
                        <button onClick={() => setShowChat(false)} className="text-gray-400 hover:text-red-700 transition duration-200">
                            <X size={25} className="sm:size-22" />
                        </button>
                    </div>

                    {/* Chat History */}
                    <div className="h-48 overflow-y-auto p-2 border border-gray-700 rounded-md my-2">
                        {chatHistory.map((msg, index) => (
                            <p key={index} className={msg.role === "user" ? "text-blue-400" : "text-green-400"}>
                                <strong>{msg.role === "user" ? "You: " : "AI: "}</strong> {msg.content}
                            </p>
                        ))}
                    </div>

                    {/* Input Field */}
                    <input
                        type="text"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                        placeholder="Ask about a work order..."
                        className="w-full p-2 rounded bg-gray-700 text-white mt-2"
                        disabled={loading}
                    />

                    {/* Send Button */}
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
