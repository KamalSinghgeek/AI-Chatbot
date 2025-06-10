import { useState, useRef, useEffect } from "react";
import ChatMessage from "./ChatMessage.jsx";

export default function App() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "👋 Welcome to Real Estate AI! How can I assist you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    setMessages((msgs) => [...msgs, { role: "user", content: trimmed }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });
      const data = await res.json();
      setMessages((msgs) => [
        ...msgs,
        { role: "assistant", content: data.response },
      ]);
    } catch (e) {
      setMessages((msgs) => [
        ...msgs,
        { role: "assistant", content: "❌ Server error. Please try again." },
      ]);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-6">
      <div className="flex flex-col w-full max-w-2xl rounded-xl shadow-lg border bg-white min-h-[70vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b text-3xl font-bold bg-blue-50 text-blue-700">
  Real Estate ChatBot
</div>


        {/* Chat Body */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {messages.map((msg, i) => (
            <ChatMessage key={i} message={msg} />
          ))}
          {loading && <ChatMessage message={{ role: "assistant", content: "Typing…" }} />}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <form
          className="flex items-center gap-2 px-4 py-3 border-t bg-white"
          onSubmit={(e) => {
            e.preventDefault();
            if (!loading) sendMessage();
          }}
        >
          <input
            type="text"
            placeholder="Ask something about real estate..."
            className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring focus:ring-blue-300"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            maxLength={300}
            autoFocus
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className={`px-4 py-2 rounded-full text-white font-medium transition ${
              loading || !input.trim()
                ? "bg-blue-300 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
