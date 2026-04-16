"use client";

import { useState, useRef, useEffect } from "react";
import MessageBubble from "./MessageBubble";
import ChatInput from "./ChatInput";
import Image from "./Image";
import LogsModal from "./LogsModal";

// ── Flin's avatar SVG ─────────────────────────────────────────
export function FlinAvatar({ size = 32 }) {
  return (
    <div
      className="rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0"
      style={{ width: size, height: size }}
    >
      <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 24 24" fill="none">
        <path d="M3 17l4-8 4 4 3-5 4 9" stroke="#00e676" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="19" cy="5" r="2" fill="#00e676"/>
      </svg>
    </div>
  );
}

// ── User initials avatar ──────────────────────────────────────
function UserAvatar({ name, avatar, size = 32 }) {
  if (avatar) {
    return (
      <img
        src={avatar} alt={name}
        className="rounded-full object-cover flex-shrink-0"
        style={{ width: size, height: size }}
      />
    );
  }
  const initials = name ? name.slice(0, 2).toUpperCase() : "?";
  return (
    <div
      className="rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center flex-shrink-0 text-xs"
      style={{ width: size, height: size }}
    >
      {initials}
    </div>
  );
}

// ── Typing indicator ──────────────────────────────────────────
function TypingIndicator() {
  return (
    <div className="flex items-center gap-2 mb-4 animate-in">
      <FlinAvatar size={32} />
      <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1 items-center shadow-sm">
        {[0, 1, 2].map((i) => (
          <span key={i} className="typing-dot w-1.5 h-1.5 rounded-full bg-gray-400 block" />
        ))}
      </div>
    </div>
  );
}

// ── Name setup screen ─────────────────────────────────────────
function NamePrompt({ onSubmit }) {
  const [value, setValue] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = value.trim();
    if (trimmed) onSubmit(trimmed);
  }

  return (
    <div className="flex flex-col items-center justify-center flex-1 px-6 pb-16">
      <div className="mb-6"><FlinAvatar size={56} /></div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-2 text-center">
        Hey, I'm Flin 👋
      </h1>
      <p className="text-gray-500 text-sm text-center mb-8">
        Your personal AI stock advisor. What should I call you?
      </p>
      <form onSubmit={handleSubmit} className="flex gap-2 w-full max-w-sm">
        <input
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Enter your name..."
          className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-gray-400 transition-colors shadow-sm"
        />
        <button
          type="submit"
          disabled={!value.trim()}
          className="bg-gray-900 text-white text-sm px-5 py-2.5 rounded-xl hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Let's go
        </button>
      </form>
    </div>
  );
}

// ── Nav dropdown for name / avatar ───────────────────────────
function NavDropdown({ userName, userAvatar, onSave, onClose }) {
  const [name, setName]       = useState(userName);
  const [preview, setPreview] = useState(userAvatar);
  const ref = useRef(null);

  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  function handleAvatarChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target.result);
    reader.readAsDataURL(file);
  }

  function handleSave() {
    onSave(name.trim() || userName, preview);
    onClose();
  }

  return (
    <div
      ref={ref}
      className="absolute right-6 top-14 z-50 bg-white border border-gray-200 rounded-2xl shadow-lg p-4 w-64"
    >
      <div className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">Your Profile</div>
      <div className="flex items-center gap-3 mb-4">
        <UserAvatar name={name} avatar={preview} size={44} />
        <label className="text-xs text-gray-500 cursor-pointer hover:text-gray-800 transition-colors">
          Change photo
          <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
        </label>
      </div>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Your name"
        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-800 outline-none focus:border-gray-400 transition-colors mb-3"
      />
      <button
        onClick={handleSave}
        className="w-full bg-gray-900 text-white text-sm py-2 rounded-xl hover:bg-gray-700 transition-colors"
      >
        Save
      </button>
    </div>
  );
}

// ── Welcome screen ────────────────────────────────────────────
function WelcomeScreen({ userName, isExiting }) {
  return (
    <div className={`flex flex-col items-center justify-center flex-1 px-6 pb-8 ${isExiting ? "welcome-exit pointer-events-none" : ""}`}>
      <h1 className="text-3xl font-semibold text-gray-900 mb-3 text-center">
        Welcome back, {userName}
      </h1>
      <p className="text-gray-500 text-base text-center mb-10 leading-relaxed">
        Ask me questions about stocks: real-time stock data,<br />
        investment concepts and more
      </p>
    </div>
  );
}

// ── ChatWindow ────────────────────────────────────────────────
export default function ChatWindow() {
  const [mounted, setMounted]         = useState(false); // ← hydration guard
  const [userName, setUserName]       = useState(null);
  const [userAvatar, setUserAvatar]   = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [messages, setMessages]       = useState([]);
  const [isLoading, setIsLoading]     = useState(false);
  const [mode, setMode]               = useState("welcome");
  const [isExiting, setIsExiting]     = useState(false);
  const [showLogsModal, setShowLogsModal] = useState(false);

  const bottomRef = useRef(null);

  // ── Wait for client mount before rendering anything ──────
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mode === "chat") {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading, mode]);

  // ── Render nothing until hydrated ────────────────────────
  if (!mounted) {
    return (
      <div className="flex flex-col h-screen bg-gradient-to-br from-sky-100 via-blue-50 to-white" />
    );
  }

  function transitionToChat() {
    if (mode === "welcome") {
      setIsExiting(true);
      setTimeout(() => setMode("chat"), 220);
    }
  }

  async function handleSend(userText) {
    transitionToChat();

    const userMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: userText,
      stockData: null,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const history = messages.map((m) => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.content }],
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText, history, userName }),
      });

      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: data.reply,
          stockData: data.stockData ?? null,
          imageUrl: data.imageUrl ?? null, 
          timestamp: new Date(),
        },
      ]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "I'm having trouble connecting, please try again!",
          stockData: null,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleNewChat() {
    setMessages([]);
    setIsExiting(false);
    setMode("welcome");
  }

  async function handleSaveConversation() {
    if (messages.length === 0) return;

    try {
      const conversation = messages.map(msg => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp,
        stockData: msg.stockData,
        imageUrl: msg.imageUrl
      }));

      const res = await fetch("/api/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversation }),
      });

      if (res.ok) {
        alert("Conversation saved successfully!");
      } else {
        alert("Failed to save conversation");
      }
    } catch (error) {
      console.error("Error saving conversation:", error);
      alert("Error saving conversation");
    }
  }

  function handleSaveProfile(name, avatar) {
    setUserName(name);
    setUserAvatar(avatar);
  }

  // ── Step 1: Name prompt ───────────────────────────────────
  if (!userName) {
    return (
      <div className="flex flex-col h-screen bg-gradient-to-br from-sky-100 via-blue-50 to-white">
        <NamePrompt onSubmit={(name) => setUserName(name)} />
      </div>
    );
  }

  // ── Step 2: Main UI ───────────────────────────────────────
  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-sky-100 via-blue-50 to-white">

      {/* ── Nav bar ── */}
      <div className="relative flex items-center gap-3 px-6 py-3 border-b border-gray-100 bg-white/50 backdrop-blur-sm flex-shrink-0">
        <FlinAvatar size={34} />
        <div>
          <div className="text-sm font-semibold text-gray-900">Flin</div>
          <div className="text-xs text-gray-400">AI Stock Advisor</div>
        </div>
        <div className="ml-auto flex items-center gap-3">
          {mode === "chat" && (
            <>
              <button
                onClick={handleSaveConversation}
                disabled={messages.length === 0}
                className="text-xs text-gray-400 hover:text-gray-700 transition-colors px-3 py-1 rounded-full hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Save
              </button>
              <button
                onClick={() => setShowLogsModal(true)}
                className="text-xs text-gray-400 hover:text-gray-700 transition-colors px-3 py-1 rounded-full hover:bg-gray-100"
              >
                Logs
              </button>
              <button
                onClick={handleNewChat}
                className="text-xs text-gray-400 hover:text-gray-700 transition-colors px-3 py-1 rounded-full hover:bg-gray-100"
              >
                New chat
              </button>
            </>
          )}
          <button
            onClick={() => setShowDropdown((v) => !v)}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <UserAvatar name={userName} avatar={userAvatar} size={32} />
            <span className="text-sm text-gray-700 font-medium hidden sm:block">{userName}</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        {showDropdown && (
          <NavDropdown
            userName={userName}
            userAvatar={userAvatar}
            onSave={handleSaveProfile}
            onClose={() => setShowDropdown(false)}
          />
        )}
      </div>

      {/* ── Welcome screen ── */}
      {mode === "welcome" && (
        <WelcomeScreen userName={userName} isExiting={isExiting} />
      )}

      {/* ── Chat messages ── */}
      {mode === "chat" && (
        <div className="flex-1 overflow-y-auto px-6 py-6 max-w-3xl w-full mx-auto">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} userName={userName} userAvatar={userAvatar} />
          ))}
          {isLoading && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>
      )}

      {/* ── Input ── */}
      <div className={`flex-shrink-0 w-full ${mode === "welcome" ? "pb-10" : "pb-6"}`}>
        <div className="max-w-2xl mx-auto px-6">
          <ChatInput onSend={handleSend} isLoading={isLoading} mode={mode} />
        </div>
      </div>

      {/* ── Logs Modal ── */}
      <LogsModal
        isOpen={showLogsModal}
        onClose={() => setShowLogsModal(false)}
        userName={userName}
        userAvatar={userAvatar}
      />

    </div>
  );
}