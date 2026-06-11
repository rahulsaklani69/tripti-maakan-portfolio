"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Mail, Check, Trash2, MailOpen, Loader2 } from "lucide-react";

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  status: "unread" | "read" | "archived";
  created_at: string;
}export default function AdminDashboard() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);

  // Fetch messages from database
  useEffect(() => {
    async function fetchMessages() {
      setLoading(true);
      if (!supabase) {
        setMessages([]);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("contact_messages")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;

        setMessages((data as ContactMessage[]) || []);
      } catch (err) {
        console.error("Supabase error fetching messages:", err);
        setMessages([]);
      } finally {
        setLoading(false);
      }
    }
    fetchMessages();
  }, []);

  // Update status (e.g., mark as read/unread/archived)
  const handleUpdateStatus = async (id: string, newStatus: "unread" | "read" | "archived") => {
    try {
      if (supabase) {
        const { error } = await supabase
          .from("contact_messages")
          .update({ status: newStatus })
          .eq("id", id);
        
        if (error) throw error;
      }

      // Update state locally
      setMessages((prev) =>
        prev.map((msg) => (msg.id === id ? { ...msg, status: newStatus } : msg))
      );

      // Update active viewer if open
      if (selectedMessage && selectedMessage.id === id) {
        setSelectedMessage((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
    } catch (err) {
      console.error("Failed to update message status:", err);
    }
  };

  // Delete message
  const handleDeleteMessage = async (id: string) => {
    if (!confirm("Are you sure you want to delete this message permanently?")) return;

    try {
      if (supabase) {
        const { error } = await supabase.from("contact_messages").delete().eq("id", id);
        if (error) throw error;
      }

      setMessages((prev) => prev.filter((msg) => msg.id !== id));
      if (selectedMessage && selectedMessage.id === id) {
        setSelectedMessage(null);
      }
    } catch (err) {
      console.error("Failed to delete message:", err);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="font-serif text-3xl md:text-4xl text-white uppercase tracking-wider">
          INCOMING MESSAGES
        </h1>
        <p className="text-xs text-luxury-white-muted uppercase tracking-widest mt-1">
          Review bookings and agency enquiries
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Messages List Column */}
        <div className="xl:col-span-7 bg-luxury-gray-900 border border-gold-500/10 p-6 space-y-4">
          <h2 className="font-serif text-lg text-white uppercase tracking-wider pb-3 border-b border-luxury-gray-800 flex justify-between items-center">
            <span>INBOX</span>
            <span className="text-[10px] bg-gold-500 text-black px-2 py-0.5 font-sans font-bold">
              {messages.filter((m) => m.status === "unread").length} NEW
            </span>
          </h2>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-gold-500 gap-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="text-[10px] tracking-widest text-luxury-white-muted uppercase">
                LOADING INBOX...
              </span>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-20 text-luxury-white-muted">
              <p className="text-xs tracking-widest uppercase">Inbox is empty.</p>
            </div>
          ) : (
            <div className="divide-y divide-luxury-gray-800">
              {messages.map((msg) => {
                const date = new Date(msg.created_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
                const isSelected = selectedMessage?.id === msg.id;

                return (
                  <div
                    key={msg.id}
                    onClick={() => {
                      setSelectedMessage(msg);
                      if (msg.status === "unread") {
                        handleUpdateStatus(msg.id, "read");
                      }
                    }}
                    className={`py-4 px-3 flex justify-between items-start cursor-pointer transition-colors duration-300 relative ${
                      isSelected
                        ? "bg-gold-500/5"
                        : "hover:bg-luxury-gray-800/40"
                    }`}
                  >
                    {/* Unread indicator dot */}
                    {msg.status === "unread" && (
                      <span className="absolute left-1 top-6 w-1.5 h-1.5 bg-gold-500 rounded-full" />
                    )}

                    <div className="pl-3 space-y-1 max-w-[75%]">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-semibold ${msg.status === "unread" ? "text-white" : "text-luxury-white-muted/80"}`}>
                          {msg.name}
                        </span>
                        <span className="text-[9px] text-luxury-white-muted/50 font-mono">
                          {msg.email}
                        </span>
                      </div>
                      <h4 className={`text-xs uppercase tracking-wider truncate ${msg.status === "unread" ? "text-gold-400 font-bold" : "text-luxury-white-muted"}`}>
                        {msg.subject || "No Subject"}
                      </h4>
                      <p className="text-[11px] text-luxury-white-muted/60 line-clamp-1">
                        {msg.message}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 text-xs">
                      <span className="text-luxury-white-muted/40 text-[10px]">{date}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteMessage(msg.id);
                        }}
                        className="text-luxury-white-muted/40 hover:text-red-400 p-1 cursor-pointer transition-colors"
                        title="Delete Message"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Message Viewer Column */}
        <div className="xl:col-span-5 bg-luxury-gray-900 border border-gold-500/10 p-6">
          {selectedMessage ? (
            <div className="space-y-6">
              <div className="flex justify-between items-start border-b border-luxury-gray-800 pb-4">
                <div className="space-y-1">
                  <h3 className="font-serif text-xl text-white uppercase tracking-wide">
                    {selectedMessage.subject || "No Subject"}
                  </h3>
                  <p className="text-xs text-gold-400">
                    From: <span className="font-semibold text-white">{selectedMessage.name}</span> ({selectedMessage.email})
                  </p>
                  <p className="text-[10px] text-luxury-white-muted/50 font-mono">
                    Received: {new Date(selectedMessage.created_at).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Message Body */}
              <div className="text-xs md:text-sm text-luxury-white-muted leading-relaxed whitespace-pre-wrap bg-black/45 p-4 border border-luxury-gray-800 min-h-40">
                {selectedMessage.message}
              </div>

              {/* Message Actions */}
              <div className="flex flex-wrap gap-3 pt-2">
                {selectedMessage.status === "read" ? (
                  <button
                    onClick={() => handleUpdateStatus(selectedMessage.id, "unread")}
                    className="flex items-center gap-2 text-[10px] tracking-wider font-semibold border border-gold-500/30 text-gold-400 hover:border-gold-500 px-4 py-2 uppercase transition-all duration-300 cursor-pointer"
                  >
                    <Mail className="h-3.5 w-3.5" /> Mark Unread
                  </button>
                ) : (
                  <button
                    onClick={() => handleUpdateStatus(selectedMessage.id, "read")}
                    className="flex items-center gap-2 text-[10px] tracking-wider font-semibold border border-gold-500/30 text-gold-400 hover:border-gold-500 px-4 py-2 uppercase transition-all duration-300 cursor-pointer"
                  >
                    <MailOpen className="h-3.5 w-3.5" /> Mark Read
                  </button>
                )}
                
                {selectedMessage.status !== "archived" && (
                  <button
                    onClick={() => handleUpdateStatus(selectedMessage.id, "archived")}
                    className="flex items-center gap-2 text-[10px] tracking-wider font-semibold border border-luxury-gray-800 text-luxury-white-muted hover:border-gold-500/30 hover:text-white px-4 py-2 uppercase transition-all duration-300 cursor-pointer"
                  >
                    <Check className="h-3.5 w-3.5" /> Archive
                  </button>
                )}

                <button
                  onClick={() => handleDeleteMessage(selectedMessage.id)}
                  className="flex items-center gap-2 text-[10px] tracking-wider font-semibold border border-transparent text-red-400 hover:bg-red-950/20 hover:border-red-900/30 px-4 py-2 uppercase transition-all duration-300 cursor-pointer ml-auto"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-24 text-luxury-white-muted/60 space-y-2">
              <Mail className="h-8 w-8 mx-auto text-gold-500/30" />
              <p className="text-xs tracking-widest uppercase">Select a message to review details.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
