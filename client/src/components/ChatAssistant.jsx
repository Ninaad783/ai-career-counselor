import { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom"; 
import API from "../services/api";
import ReactMarkdown from "react-markdown"; 
import { FaCommentDots, FaTimes, FaPaperPlane, FaRobot } from "react-icons/fa";

const ChatAssistant = () => {
  const location = useLocation(); 
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    { id: 1, text: "Hey! I'm Nexus Bot, your on-demand career sidekick. Ask me anything about interviews, skills, or resumes!", sender: "bot" }
  ]);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || sending) return;

    const userMsg = { id: Date.now(), text: message, sender: "user" };
    setMessages((prev) => [...prev, userMsg]);
    const currentInput = message;
    setMessage("");
    setSending(true);

    try {
      const res = await API.post("/ai/chat-assistant", {
        message: currentInput,
        history: messages.slice(-5) 
      });

      if (res.data.success) {
        setMessages((prev) => [...prev, { id: Date.now() + 1, text: res.data.response, sender: "bot" }]);
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => [...prev, { id: Date.now() + 1, text: "Connection error. Could not ping assistant array.", sender: "bot" }]);
    } finally {
      setSending(false);
    }
  };

  // --- DYNAMIC ROUTING & SESSION GUARDS ---
  const isLoggedIn = !!localStorage.getItem("user");
  const publicPages = ["/", "/login", "/signup", "/register"];
  const isPublicPage = publicPages.includes(location.pathname);

  // Force-hide the chatbot completely if logged out OR browsing any auth/landing views
  if (!isLoggedIn || isPublicPage) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 select-none">
      
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 rounded-full bg-gradient-to-tr from-purple-600 to-pink-500 text-white flex items-center justify-center text-2xl shadow-[0_0_25px_rgba(168,85,247,0.5)] hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer"
        >
          <FaCommentDots className="animate-pulse" />
        </button>
      )}

      {isOpen && (
        <div className="w-[350px] sm:w-[380px] h-[480px] bg-[#0a0f24]/95 border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden backdrop-blur-xl animate-fadeIn">
          
          <div className="p-4 bg-white/[0.02] border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center text-sm shadow-[0_0_10px_rgba(168,85,247,0.2)]">
                <FaRobot />
              </div>
              <div>
                <h4 className="text-sm font-bold tracking-wide text-gray-100">Nexus Core Assistant</h4>
                <p className="text-[10px] text-emerald-400 font-medium">Online & Ready</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-gray-300 transition-colors cursor-pointer">
              <FaTimes />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 custom-scrollbar">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex w-full ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-2xl p-3 text-sm font-light leading-relaxed border ${
                    msg.sender === "user"
                      ? "bg-purple-600/20 border-purple-500/30 text-purple-100 rounded-tr-none"
                      : "bg-white/[0.02] border-white/5 text-gray-300 rounded-tl-none"
                  }`}
                >
                  {msg.sender === "user" ? (
                    msg.text
                  ) : (
                    <ReactMarkdown 
                      components={{
                        p: ({ node, ...props }) => <p className="mb-1 last:mb-0" {...props} />,
                        strong: ({ node, ...props }) => <strong className="font-bold text-white bg-white/5 px-1 rounded" {...props} />
                      }}
                    >
                      {msg.text}
                    </ReactMarkdown>
                  )}
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex justify-start items-center gap-2 text-xs text-gray-500 font-medium pl-1 animate-pulse">
                <FaRobot className="animate-spin text-purple-400" />
                <span>Typing guidance...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="p-3 bg-white/[0.01] border-t border-white/5 flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask about MERN stack, resume keywords..."
              className="flex-1 px-4 py-2.5 bg-white/[0.03] border border-white/10 rounded-xl text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-purple-500/40 transition-all"
            />
            <button
              type="submit"
              disabled={!message.trim() || sending}
              className="px-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white transition-all active:scale-95 disabled:opacity-30 cursor-pointer flex items-center justify-center"
            >
              <FaPaperPlane className="text-xs" />
            </button>
          </form>

        </div>
      )}

    </div>
  );
};

export default ChatAssistant;