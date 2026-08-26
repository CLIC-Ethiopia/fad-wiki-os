import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Key } from "lucide-react";

type Message = {
  id: string;
  role: "user" | "agent";
  content: string;
};

const PRECONFIGURED_PROMPTS = [
  "How to use the agent?",
  "Summarize recent notes",
  "Help",
  "What can you do?",
];

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "agent",
      content: "Hello! I am your Wiki Agent. How can I help you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [apiKey, setApiKey] = useState("");
  const [isKeySaved, setIsKeySaved] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  useEffect(() => {
    const savedKey = localStorage.getItem("wiki_gemini_api_key");
    if (savedKey) {
      setApiKey(savedKey);
      setIsKeySaved(true);
    }
  }, []);

  const saveKey = () => {
    if (apiKey.trim()) {
      localStorage.setItem("wiki_gemini_api_key", apiKey.trim());
      setIsKeySaved(true);
    }
  };

  const handleSend = async (text: string) => {
    if (!text.trim() || !isKeySaved || isSending) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text.trim(),
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setIsSending(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey,
          message: text.trim(),
          history: messages.filter(m => m.id !== "1") // filter out greeting
        }),
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to communicate with agent.");
      }

      const agentMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "agent",
        content: data.response,
      };
      setMessages((prev) => [...prev, agentMsg]);
    } catch (error: any) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "agent",
        content: `Error: ${error.message}`,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsSending(false);
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend(input);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="mb-4 flex h-[500px] w-[350px] sm:w-[400px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl border border-gray-200 font-sans">
          {/* Header */}
          <div className="flex items-center justify-between bg-gradient-to-r from-purple-700 to-rose-600 px-4 py-3 text-white">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <MessageCircle size={20} />
              Wiki Agent
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-full p-1 hover:bg-white/20 transition-colors"
              aria-label="Close chat"
            >
              <X size={20} />
            </button>
          </div>

          {!isKeySaved ? (
            <div className="flex-1 p-6 flex flex-col justify-center items-center gap-4 bg-gray-50 text-center">
              <Key className="text-purple-600 h-10 w-10 mb-2" />
              <h4 className="text-lg font-semibold text-gray-800">API Key Required</h4>
              <p className="text-sm text-gray-600 mb-4">
                Please provide your Gemini API Key to use the Wiki Agent. It will be stored securely in your browser.
              </p>
              <input
                type="password"
                placeholder="AIzaSy..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
              />
              <button
                onClick={saveKey}
                disabled={!apiKey.trim()}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-700 to-rose-600 hover:from-purple-800 hover:to-rose-700 text-white font-bold shadow-md hover:shadow-lg disabled:opacity-50 transition-all active:scale-95"
              >
                Save & Continue
              </button>
            </div>
          ) : (
            <>
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow-sm whitespace-pre-wrap ${
                        msg.role === "user"
                          ? "bg-gradient-to-r from-purple-700 to-rose-600 text-white rounded-br-none"
                          : "bg-white text-gray-800 border border-gray-100 rounded-bl-none"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
                {isSending && (
                  <div className="flex justify-start">
                    <div className="max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow-sm bg-white text-gray-800 border border-gray-100 rounded-bl-none">
                      <div className="flex gap-1 items-center h-4">
                        <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Preconfigured Prompts */}
              <div className="flex overflow-x-auto whitespace-nowrap border-t border-gray-100 bg-white px-2 py-2 scrollbar-hide">
                {PRECONFIGURED_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => handleSend(prompt)}
                    disabled={isSending}
                    className="mr-2 inline-block rounded-full border border-purple-200 bg-purple-50 px-3 py-1.5 text-xs font-medium text-purple-700 hover:bg-purple-100 disabled:opacity-50 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-1"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              {/* Input Area */}
              <div className="border-t border-gray-200 bg-white p-3">
                <form onSubmit={onSubmit} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={isSending}
                    placeholder="Ask me anything..."
                    className="flex-1 rounded-full border border-gray-300 bg-gray-50 px-4 py-2 text-sm text-gray-900 focus:border-purple-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-purple-500 disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || isSending}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-r from-purple-700 to-rose-600 text-white hover:from-purple-800 hover:to-rose-700 disabled:opacity-50 transition-all shadow-sm active:scale-95"
                    aria-label="Send message"
                  >
                    <Send size={16} className="-ml-0.5" />
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      )}

      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-purple-700 to-rose-600 text-white shadow-lg hover:from-purple-800 hover:to-rose-700 hover:scale-105 active:scale-95 transition-all duration-200"
          aria-label="Open chat"
        >
          <MessageCircle size={28} />
        </button>
      )}
    </div>
  );
}
