"use client";

import StockCard from "./StockCard";
import { FlinAvatar } from "./ChatWindow";

// Render **bold**, strip ###, ---, *** from message text
function renderText(text) {
  const cleaned = text
    .split("\n")
    .map((line) => {
      // Remove markdown headings (###, ##, #)
      line = line.replace(/^#{1,6}\s+/, "");
      // Remove horizontal rules
      if (/^(\*\*\*|---|___)\s*$/.test(line)) return null;
      return line;
    })
    .filter((line) => line !== null)
    .join("\n");

  return cleaned.split("\n").map((line, i, arr) => {
    const parts = line.split(/\*\*(.*?)\*\*/g);
    const rendered = parts.map((part, j) =>
      j % 2 === 1 ? (
        <strong key={j} className="font-semibold text-gray-900">{part}</strong>
      ) : part
    );
    return (
      <span key={i}>
        {rendered}
        {i < arr.length - 1 && <br />}
      </span>
    );
  });
}

function UserAvatar({ name, avatar }) {
  if (avatar) {
    return (
      <img src={avatar} alt={name}
        className="w-8 h-8 rounded-full object-cover flex-shrink-0 mt-0.5" />
    );
  }
  return (
    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
      {name ? name.slice(0, 2).toUpperCase() : "?"}
    </div>
  );
}

export default function MessageBubble({ message, userName, userAvatar }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex gap-3 mb-5 animate-in ${isUser ? "flex-row-reverse" : "flex-row"}`}>

      {/* Avatar */}
      {isUser
        ? <UserAvatar name={userName} avatar={userAvatar} />
        : <div className="mt-0.5"><FlinAvatar size={32} /></div>
      }

      {/* Bubble + stock card */}
      <div className={`flex flex-col gap-2 max-w-[75%] ${isUser ? "items-end" : "items-start"}`}>
        <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
          isUser
            ? "bg-gray-900 text-white rounded-tr-sm"
            : "bg-white border border-gray-200 text-gray-700 rounded-tl-sm"
        }`}>
          {renderText(message.content)}
        </div>

        {!isUser && message.stockData && (
          <StockCard stock={message.stockData} />
        )}

        <span className="text-xs text-gray-400 px-1">
          {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>
    </div>
  );
}