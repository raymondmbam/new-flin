"use client";

import { useState, useEffect } from "react";
import { FlinAvatar } from "./ChatWindow";

function UserAvatar({ name, avatar }) {
  if (avatar) {
    return (
      <img src={avatar} alt={name}
        className="w-6 h-6 rounded-full object-cover flex-shrink-0" />
    );
  }
  return (
    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center flex-shrink-0">
      {name ? name.slice(0, 2).toUpperCase() : "?"}
    </div>
  );
}

function ConversationPreview({ conversation, onSelect }) {
  const formatTime = (date) => {
    return new Date(date).toLocaleString();
  };

  return (
    <div
      onClick={() => onSelect(conversation)}
      className="p-4 border border-gray-200 rounded-xl hover:border-gray-300 cursor-pointer transition-colors bg-white"
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="text-sm font-medium text-gray-900">
          {formatTime(conversation.timestamp)}
        </div>
        <div className="text-xs text-gray-500">
          {conversation.messageCount} messages
        </div>
      </div>
      <div className="text-sm text-gray-600 line-clamp-2">
        {conversation.preview}
      </div>
    </div>
  );
}

function ConversationDetail({ conversation, userName, userAvatar, onBack }) {
  const formatTime = (date) => {
    return new Date(date).toLocaleString();
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 p-4 border-b border-gray-200">
        <button
          onClick={onBack}
          className="text-gray-500 hover:text-gray-700 transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <div>
          <div className="text-sm font-medium text-gray-900">
            Conversation
          </div>
          <div className="text-xs text-gray-500">
            {formatTime(conversation.timestamp)}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {conversation.messages.map((msg, index) => (
          <div key={index} className="flex gap-3">
            {msg.role === "user" ? (
              <UserAvatar name={userName} avatar={userAvatar} />
            ) : (
              <FlinAvatar size={24} />
            )}
            <div className="flex-1">
              <div className="text-xs text-gray-500 mb-1">
                {msg.role === "user" ? userName : "Flin"} • {formatTime(msg.timestamp)}
              </div>
              <div className="text-sm text-gray-800 whitespace-pre-wrap">
                {msg.content}
              </div>
              {msg.stockData && (
                <div className="mt-2 p-2 bg-gray-50 rounded-lg text-xs">
                  <div className="font-medium">{msg.stockData.symbol}</div>
                  <div>${msg.stockData.price} ({msg.stockData.change >= 0 ? '+' : ''}{msg.stockData.change})</div>
                </div>
              )}
              {msg.imageUrl && (
                <div className="mt-2">
                  <img src={msg.imageUrl} alt="Generated" className="max-w-xs rounded-lg" />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function LogsModal({ isOpen, onClose, userName, userAvatar }) {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchLogs();
    }
  }, [isOpen]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/log");
      if (res.ok) {
        const data = await res.json();
        setConversations(data.conversations);
      }
    } catch (error) {
      console.error("Failed to fetch logs:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl h-[80vh] flex flex-col">
        {!selectedConversation ? (
          <>
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Conversation Logs</h2>
                <button
                  onClick={onClose}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {loading ? (
                <div className="text-center text-gray-500 py-8">Loading logs...</div>
              ) : conversations.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  No conversations logged yet
                </div>
              ) : (
                <div className="space-y-3">
                  {conversations.map((conv) => (
                    <ConversationPreview
                      key={conv.id}
                      conversation={conv}
                      onSelect={setSelectedConversation}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <ConversationDetail
            conversation={selectedConversation}
            userName={userName}
            userAvatar={userAvatar}
            onBack={() => setSelectedConversation(null)}
          />
        )}
      </div>
    </div>
  );
}