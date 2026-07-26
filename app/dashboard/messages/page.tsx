"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  fetchInbox,
  sendMessage,
  findConversation,
  createConversation,
  editMessage,
  deleteMessage,
  markConversationRead,
  toggleMute,
  togglePin,
  archiveConversation,
  reactToMessage,
  fetchEligibleUsers,
} from "@/lib/actions/messages";
import { MessageType } from "@prisma/client";
import {
  MessageSquare,
  Search,
  Pin,
  VolumeX,
  Volume2,
  Archive,
  Send,
  Paperclip,
  Trash2,
  Edit2,
  CheckCheck,
  PlusCircle,
  FileText,
  Smile,
  X,
  ArrowLeft,
  BookOpen
} from "lucide-react";
import NextImage from "next/image";
import Link from "next/link";

export default function MessagesDashboardPage() {
  const { user } = useAuth();

  // State Management
  const [inbox, setInbox] = useState<any[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [activeChat, setActiveChat] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [inboxTab, setInboxTab] = useState<"active" | "archived">("active");
  const [messageText, setMessageText] = useState("");
  const [eligibleUsers, setEligibleUsers] = useState<any[]>([]);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [newChatSearch, setNewChatSearch] = useState("");
  
  // Attachment state simulation
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [attachedFile, setAttachedFile] = useState<{ url: string; name: string; type: MessageType } | null>(null);

  // Message editing state
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");

  const chatEndRef = useRef<HTMLDivElement>(null);
  const _dragRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Fetch inbox on load
  const loadInbox = async () => {
    try {
      const data = await fetchInbox(inboxTab === "archived");
      setInbox(data);
    } catch (err) {
      console.error("Failed to load inbox:", err);
    }
  };

  useEffect(() => {
    loadInbox();
    // Poll for new messages every 8 seconds (real-time adapter simulation fallback)
    const interval = setInterval(loadInbox, 8000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inboxTab]);

  // Load active chat details when activeConversationId changes
  useEffect(() => {
    if (!activeConversationId) {
      setActiveChat(null);
      return;
    }

    const loadChat = async () => {
      try {
        const chat = await findConversation(activeConversationId);
        setActiveChat(chat);
        // Mark read
        await markConversationRead(activeConversationId);
        loadInbox();
      } catch (err) {
        console.error("Failed to load conversation details:", err);
      }
    };

    loadChat();
    // Poll active chat messages every 4 seconds
    const interval = setInterval(loadChat, 4000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeConversationId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeChat?.messages]);

  // Load eligible users for starting new conversations
  const loadEligibleUsers = async () => {
    try {
      const users = await fetchEligibleUsers();
      setEligibleUsers(users);
    } catch (err) {
      console.error("Failed to load eligible users:", err);
    }
  };

  useEffect(() => {
    loadEligibleUsers();
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeConversationId || (!messageText.trim() && !attachedFile)) return;

    try {
      let finalType: MessageType = MessageType.TEXT;
      let finalImageUrl: string | undefined = undefined;
      let finalAttachmentUrl: string | undefined = undefined;

      if (attachedFile) {
        finalType = attachedFile.type;
        if (finalType === MessageType.IMAGE) {
          finalImageUrl = attachedFile.url;
        } else {
          finalAttachmentUrl = attachedFile.url;
        }
      }

      await sendMessage(
        activeConversationId,
        messageText || undefined,
        finalImageUrl,
        finalAttachmentUrl,
        finalType
      );

      setMessageText("");
      setAttachedFile(null);
      
      // Reload chat
      const chat = await findConversation(activeConversationId);
      setActiveChat(chat);
      loadInbox();
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  const handleCreateChat = async (targetUserId: string, targetUserName: string) => {
    try {
      const conv = await createConversation([targetUserId], undefined, `${targetUserName} Chat`);
      setActiveConversationId(conv.id);
      setShowNewChatModal(false);
      loadInbox();
    } catch (err) {
      console.error("Failed to create conversation:", err);
    }
  };

  const handleToggleMute = async (cId: string) => {
    try {
      await toggleMute(cId);
      loadInbox();
      if (activeChat?.id === cId) {
        const chat = await findConversation(cId);
        setActiveChat(chat);
      }
    } catch (err) {
      console.error("Mute toggle failed:", err);
    }
  };

  const handleTogglePin = async (cId: string) => {
    try {
      await togglePin(cId);
      loadInbox();
    } catch (err) {
      console.error("Pin toggle failed:", err);
    }
  };

  const handleArchive = async (cId: string, archiveState: boolean) => {
    try {
      await archiveConversation(cId, archiveState);
      setActiveConversationId(null);
      loadInbox();
    } catch (err) {
      console.error("Archive failed:", err);
    }
  };

  const handleReaction = async (msgId: string, emoji: string) => {
    if (!activeConversationId) return;
    try {
      await reactToMessage(msgId, emoji);
      const chat = await findConversation(activeConversationId);
      setActiveChat(chat);
    } catch (err) {
      console.error("Failed to add emoji reaction:", err);
    }
  };

  const handleEditMessageSubmit = async (msgId: string) => {
    if (!editingText.trim()) return;
    try {
      await editMessage(msgId, editingText);
      setEditingMessageId(null);
      if (activeConversationId) {
        const chat = await findConversation(activeConversationId);
        setActiveChat(chat);
      }
    } catch (err) {
      console.error("Edit message failed:", err);
    }
  };

  const handleDeleteMessageSubmit = async (msgId: string) => {
    try {
      await deleteMessage(msgId);
      if (activeConversationId) {
        const chat = await findConversation(activeConversationId);
        setActiveChat(chat);
      }
    } catch (err) {
      console.error("Delete message failed:", err);
    }
  };

  // Drag and drop attachment simulation
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true);
    } else if (e.type === "dragleave") {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      simulateFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      simulateFileUpload(e.target.files[0]);
    }
  };

  const simulateFileUpload = (file: File) => {
    setIsUploading(true);
    setUploadProgress(10);
    
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 20;
      });
    }, 150);

    setTimeout(() => {
      clearInterval(interval);
      setUploadProgress(100);
      setIsUploading(false);

      // Detect type
      let type: MessageType = MessageType.FILE;
      if (file.type.startsWith("image/")) {
        type = MessageType.IMAGE;
      }

      setAttachedFile({
        url: URL.createObjectURL(file) || "https://uploadthing-mock.com/files/document_mock.pdf",
        name: file.name,
        type,
      });
    }, 1000);
  };

  // Filter conversations based on query
  const filteredInbox = inbox.filter((ic) => {
    const title = ic.conversation.title || "";
    const names = ic.conversation.participants
      .map((p: any) => p.user.name || p.user.email)
      .join(" ");
    const searchString = `${title} ${names}`.toLowerCase();
    return searchString.includes(searchQuery.toLowerCase());
  });

  // Filter eligible users for starting a new chat
  const filteredEligibleUsers = eligibleUsers.filter((u) => {
    const name = u.name || "";
    const email = u.email || "";
    const searchString = `${name} ${email}`.toLowerCase();
    return searchString.includes(newChatSearch.toLowerCase());
  });

  return (
    <div 
      className="h-[calc(100vh-10rem)] border border-warm-200/60 rounded-[2rem] overflow-hidden bg-white shadow-sm flex flex-col md:flex-row relative"
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
    >
      {/* Drag overlay */}
      {isDragging && (
        <div className="absolute inset-0 bg-maroon-900/10 backdrop-blur-sm border-4 border-dashed border-maroon-800 rounded-[2rem] flex flex-col items-center justify-center z-50 pointer-events-none">
          <Paperclip size={48} className="text-maroon-800 animate-bounce mb-2" />
          <h3 className="font-display font-bold text-lg text-charcoal-900">Drop files to attach</h3>
          <p className="text-charcoal-500 text-xs mt-1">Images, PDFs, or general documents</p>
        </div>
      )}

      {/* 1. Inbox Sidebar (Left) */}
      <div className={`w-full md:w-80 border-r border-warm-150 flex flex-col bg-warm-50/10 h-full ${activeConversationId ? "hidden md:flex" : "flex"}`}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-warm-150 space-y-3">
          <div className="flex justify-between items-center">
            <h2 className="font-display font-bold text-lg text-charcoal-950 flex items-center gap-1.5">
              <MessageSquare size={18} className="text-maroon-600" />
              Inbox Channel
            </h2>
            <button
              onClick={() => {
                setShowNewChatModal(true);
                setNewChatSearch("");
              }}
              title="Start New Conversation"
              className="text-maroon-700 hover:text-maroon-900 cursor-pointer flex items-center gap-1 font-bold text-xs uppercase tracking-wider transition-colors"
            >
              <PlusCircle size={18} />
            </button>
          </div>

          {/* Tab Selector */}
          <div className="flex bg-warm-100 p-0.5 rounded-xl text-xs font-bold text-charcoal-600">
            <button
              onClick={() => setInboxTab("active")}
              className={`flex-1 py-1 text-center rounded-lg transition-all cursor-pointer ${
                inboxTab === "active" ? "bg-white text-charcoal-900 shadow-sm" : "hover:text-charcoal-900"
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setInboxTab("archived")}
              className={`flex-1 py-1 text-center rounded-lg transition-all cursor-pointer ${
                inboxTab === "archived" ? "bg-white text-charcoal-900 shadow-sm" : "hover:text-charcoal-900"
              }`}
            >
              Archived
            </button>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-charcoal-400" size={14} />
            <input
              type="text"
              placeholder="Search chat or user..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-luxury text-xs pl-8 py-1.5 h-9 bg-warm-50/50"
            />
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto divide-y divide-warm-100">
          {filteredInbox.length === 0 ? (
            <div className="p-8 text-center text-xs text-charcoal-400 font-medium">
              No conversations found.
            </div>
          ) : (
            filteredInbox.map((ic) => {
              // Get other participant name and avatar
              const otherParticipants = ic.conversation.participants.filter(
                (p: any) => p.userId !== user?.id
              );
              const otherUser = otherParticipants[0]?.user;
              const chatTitle = ic.conversation.title || otherUser?.name || otherUser?.email.split("@")[0] || "Chat";
              const lastMsg = ic.conversation.messages[0];
              const isActive = activeConversationId === ic.conversation.id;

              return (
                <div
                  key={ic.conversation.id}
                  onClick={() => setActiveConversationId(ic.conversation.id)}
                  className={`p-3.5 flex justify-between items-start gap-3 cursor-pointer transition-colors relative hover:bg-warm-50/40 ${
                    isActive ? "bg-warm-50 border-r-2 border-maroon-700" : ""
                  }`}
                >
                  {/* User Profile Info */}
                  <div className="flex gap-2.5 items-center min-w-0">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-warm-200 flex-shrink-0 relative">
                      <NextImage
                        fill
                        src={otherUser?.avatar || "https://i.pravatar.cc/80?img=5"}
                        alt={chatTitle}
                        className="object-cover"
                        unoptimized
                      />
                    </div>

                    <div className="min-w-0">
                      <h4 className="font-display font-bold text-xs text-charcoal-900 truncate">
                        {chatTitle}
                      </h4>
                      {lastMsg && (
                        <p className={`text-[10px] truncate mt-0.5 ${
                          ic.unreadCount > 0 ? "text-charcoal-950 font-bold" : "text-charcoal-450"
                        }`}>
                          {lastMsg.senderId === user?.id ? "You: " : ""}
                          {lastMsg.text || "Attachment"}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions & Badges */}
                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0 text-[10px] text-charcoal-400 font-medium">
                    <span>
                      {lastMsg ? new Date(lastMsg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                    </span>
                    <div className="flex gap-1.5 items-center">
                      {ic.pinned && <Pin size={10} className="text-amber-500 fill-amber-500" />}
                      {ic.muted && <VolumeX size={10} className="text-charcoal-400" />}
                      {ic.unreadCount > 0 && (
                        <span className="bg-maroon-800 text-white rounded-full px-1.5 py-0.5 text-[9px] font-extrabold">
                          {ic.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 2. Messaging Panel (Right / Center) */}
      <div className={`flex-1 flex flex-col h-full bg-warm-50/5 relative ${!activeConversationId ? "hidden md:flex items-center justify-center text-center p-8 bg-warm-50/15" : "flex"}`}>
        {!activeConversationId ? (
          <div className="space-y-3 max-w-sm">
            <div className="w-16 h-16 rounded-full bg-maroon-50 text-maroon-600 flex items-center justify-center mx-auto mb-4">
              <MessageSquare size={32} />
            </div>
            <h3 className="font-display font-bold text-base text-charcoal-900">Your Communication Hub</h3>
            <p className="text-charcoal-500 text-xs leading-relaxed font-medium">
              Start a conversation with host families, local Liaison agents, or global support teams. Toggle categories or select user listings above.
            </p>
          </div>
        ) : (
          <>
            {/* Conversation Header */}
            <div className="p-4 border-b border-warm-150 flex justify-between items-center bg-white shadow-sm flex-shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                {/* Mobile Back Button */}
                <button
                  onClick={() => setActiveConversationId(null)}
                  className="md:hidden p-1 rounded hover:bg-warm-100 mr-1 text-charcoal-600 cursor-pointer"
                >
                  <ArrowLeft size={16} />
                </button>

                <div className="w-10 h-10 rounded-full overflow-hidden bg-warm-200 relative flex-shrink-0">
                  <NextImage
                    fill
                    src={activeChat?.participants.filter((p: any) => p.userId !== user?.id)[0]?.user?.avatar || "https://i.pravatar.cc/80?img=5"}
                    alt="Active Avatar"
                    className="object-cover"
                    unoptimized
                  />
                </div>

                <div className="min-w-0">
                  <h3 className="font-display font-bold text-xs sm:text-sm text-charcoal-900 truncate">
                    {activeChat?.title || activeChat?.participants.filter((p: any) => p.userId !== user?.id)[0]?.user?.name || "Active Chat"}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span className="text-[10px] text-charcoal-400 font-semibold uppercase tracking-wider">
                      {activeChat?.participants.filter((p: any) => p.userId !== user?.id)[0]?.user?.role || "PARTICIPANT"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Chat Actions */}
              <div className="flex gap-2 items-center flex-shrink-0">
                {/* Booking Link if active */}
                {activeChat?.bookingId && (
                  <Link
                    href="/dashboard/bookings"
                    title="View related booking details"
                    className="p-2 border border-warm-200 text-charcoal-600 hover:bg-warm-50 rounded-xl"
                  >
                    <BookOpen size={14} />
                  </Link>
                )}

                {/* Mute */}
                <button
                  onClick={() => handleToggleMute(activeChat.id)}
                  title={activeChat?.participants.find((p: any) => p.userId === user?.id)?.muted ? "Unmute Notifications" : "Mute Notifications"}
                  className={`p-2 border rounded-xl cursor-pointer ${
                    activeChat?.participants.find((p: any) => p.userId === user?.id)?.muted
                      ? "bg-rose-50 border-rose-100 text-rose-650 hover:bg-rose-100"
                      : "border-warm-200 text-charcoal-600 hover:bg-warm-50"
                  }`}
                >
                  {activeChat?.participants.find((p: any) => p.userId === user?.id)?.muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                </button>

                {/* Pin */}
                <button
                  onClick={() => handleTogglePin(activeChat.id)}
                  title="Toggle Pinned State"
                  className={`p-2 border rounded-xl cursor-pointer ${
                    activeChat?.participants.find((p: any) => p.userId === user?.id)?.pinned
                      ? "bg-amber-50 border-amber-150 text-amber-600 hover:bg-amber-100"
                      : "border-warm-200 text-charcoal-600 hover:bg-warm-50"
                  }`}
                >
                  <Pin size={14} />
                </button>

                {/* Archive / Unarchive */}
                <button
                  onClick={() => handleArchive(activeChat.id, !activeChat.archived)}
                  title={activeChat?.archived ? "Unarchive Conversation" : "Archive Conversation"}
                  className="p-2 border border-warm-200 text-charcoal-600 hover:bg-warm-50 rounded-xl cursor-pointer"
                >
                  <Archive size={14} />
                </button>
              </div>
            </div>

            {/* Message Thread Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {activeChat?.messages.length === 0 ? (
                <div className="p-8 text-center text-xs text-charcoal-400 font-semibold italic">
                  No messages exchanged yet. Send a greeting to start the conversation!
                </div>
              ) : (
                activeChat?.messages.map((msg: any) => {
                  const isMe = msg.senderId === user?.id;

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMe ? "items-end" : "items-start"} max-w-[85%] ${
                        isMe ? "ml-auto" : "mr-auto"
                      }`}
                    >
                      {/* Name / Avatar label (only for group or other sender) */}
                      {!isMe && (
                        <div className="flex items-center gap-1.5 mb-1 pl-1">
                          <span className="text-[10px] font-bold text-charcoal-800">
                            {msg.sender.name || msg.sender.email.split("@")[0]}
                          </span>
                        </div>
                      )}

                      {/* Chat bubble body */}
                      <div className={`p-3 rounded-2xl text-xs leading-relaxed space-y-1.5 relative group shadow-sm ${
                        isMe ? "bg-maroon-800 text-white rounded-tr-none" : "bg-white text-charcoal-800 rounded-tl-none border border-warm-150"
                      }`}>
                        {/* Edit Form inline */}
                        {editingMessageId === msg.id ? (
                          <div className="flex flex-col gap-2 min-w-[200px]">
                            <input
                              type="text"
                              value={editingText}
                              onChange={(e) => setEditingText(e.target.value)}
                              className="input-luxury text-xs py-1 h-8 text-charcoal-800"
                            />
                            <div className="flex gap-1.5 justify-end">
                              <button
                                onClick={() => setEditingMessageId(null)}
                                className="px-2 py-0.5 rounded border border-warm-250 text-[10px] font-semibold text-charcoal-600 bg-white"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleEditMessageSubmit(msg.id)}
                                className="px-2 py-0.5 rounded bg-emerald-650 text-[10px] font-bold text-white uppercase tracking-wider"
                              >
                                Save
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            {/* Text */}
                            {msg.text && <p className="font-medium">{msg.text}</p>}

                            {/* Image Attachment */}
                            {msg.image && (
                              <div className="rounded-xl overflow-hidden max-w-[240px] border border-warm-100 bg-warm-50 mt-1 relative h-[160px]">
                                <NextImage
                                  fill
                                  src={msg.image}
                                  alt="Attachment Preview"
                                  className="object-cover"
                                  unoptimized
                                />
                              </div>
                            )}

                            {/* File Attachment */}
                            {msg.attachment && (
                              <a
                                href={msg.attachment}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-2 p-2 rounded-xl bg-warm-50/15 border border-warm-100 hover:bg-warm-100/35 transition-colors mt-1 font-semibold"
                              >
                                <FileText size={16} className={isMe ? "text-white" : "text-maroon-800"} />
                                <span className="truncate max-w-[120px] text-[10px]">{msg.attachment.split("/").pop() || "Document.pdf"}</span>
                              </a>
                            )}
                          </>
                        )}

                        {/* Actions overlay for self messages (hover) */}
                        {isMe && editingMessageId !== msg.id && (
                          <div className="absolute right-0 top-0 translate-x-2 -translate-y-2 scale-0 group-hover:scale-100 transition-transform bg-charcoal-900 text-white rounded-lg flex items-center shadow border border-warm-200/50 p-1 gap-1 z-10">
                            <button
                              onClick={() => {
                                setEditingMessageId(msg.id);
                                setEditingText(msg.text || "");
                              }}
                              title="Edit Message"
                              className="p-1 hover:bg-warm-750 rounded text-sky-400 cursor-pointer"
                            >
                              <Edit2 size={10} />
                            </button>
                            <button
                              onClick={() => handleDeleteMessageSubmit(msg.id)}
                              title="Delete Message"
                              className="p-1 hover:bg-warm-750 rounded text-rose-400 cursor-pointer"
                            >
                              <Trash2 size={10} />
                            </button>
                          </div>
                        )}

                        {/* Reaction details overlay if any */}
                        {msg.reactions && msg.reactions.length > 0 && (
                          <div className="flex gap-1 mt-1.5 flex-wrap">
                            {msg.reactions.map((r: any) => (
                              <span
                                key={r.id}
                                title={`Reacted by ${r.user.name || r.user.email}`}
                                className="inline-block bg-warm-50 text-[10px] px-1 py-0.5 rounded border border-warm-150 shadow-sm"
                              >
                                {r.emoji}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Footer indicators (time, read receipts, reactions triggers) */}
                      <div className="flex items-center gap-2 mt-1 px-1">
                        <span className="text-[9px] text-charcoal-400 font-semibold">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {isMe && <CheckCheck size={11} className="text-emerald-500" />}

                        {/* Reaction Add Trigger */}
                        <div className="relative group/react flex items-center">
                          <button
                            title="React to message"
                            className="text-charcoal-400 hover:text-charcoal-600 transition-colors p-0.5"
                          >
                            <Smile size={10} />
                          </button>
                          <div className="absolute bottom-4 left-0 scale-0 group-hover/react:scale-100 transition-transform bg-white rounded-xl shadow-lg border border-warm-200 p-1 flex gap-1.5 z-20">
                            {["❤️", "👍", "🎉", "🙏", "😂"].map((emoji) => (
                              <button
                                key={emoji}
                                onClick={() => handleReaction(msg.id, emoji)}
                                className="hover:scale-125 transition-transform text-xs cursor-pointer"
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Composer (Bottom Editor) */}
            <div className="p-4 border-t border-warm-150 bg-white flex-shrink-0">
              <form onSubmit={handleSendMessage} className="space-y-3">
                {/* Upload attachment display if attached */}
                {attachedFile && (
                  <div className="flex justify-between items-center p-2 rounded-xl bg-warm-50 border border-warm-150 text-xs">
                    <span className="font-semibold text-charcoal-700 truncate max-w-[200px]">
                      Attachment selected: {attachedFile.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => setAttachedFile(null)}
                      className="text-rose-650 hover:opacity-85 font-semibold cursor-pointer"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}

                {/* Progress bar simulation */}
                {isUploading && (
                  <div className="w-full bg-warm-200 h-1 rounded-full overflow-hidden">
                    <div 
                      className="bg-maroon-800 h-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                )}

                {/* Main composition input tray */}
                <div className="flex gap-2 items-center">
                  {/* File attach input button */}
                  <label className="p-2 border border-warm-200 text-charcoal-600 hover:bg-warm-50 rounded-xl cursor-pointer flex-shrink-0 flex items-center justify-center">
                    <Paperclip size={16} />
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleFileChange}
                      accept="image/*,application/pdf,audio/*"
                    />
                  </label>

                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => {
                      if (e.target.value.length <= 1000) {
                        setMessageText(e.target.value);
                      }
                    }}
                    placeholder="Type your message details here..."
                    className="input-luxury text-xs py-2 h-10 w-full bg-warm-50/30"
                  />

                  {/* Character Counter */}
                  <span className="text-[10px] font-bold text-charcoal-400 flex-shrink-0">
                    {messageText.length}/1000
                  </span>

                  <button
                    type="submit"
                    className="bg-maroon-800 text-white rounded-xl p-2.5 hover:bg-maroon-900 transition-colors cursor-pointer flex-shrink-0 flex items-center justify-center shadow-sm"
                  >
                    <Send size={16} />
                  </button>
                </div>
              </form>
            </div>
          </>
        )}
      </div>

      {/* 3. New Chat Modal Dialog */}
      {showNewChatModal && (
        <div className="fixed inset-0 bg-charcoal-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-warm-200 p-6 rounded-[2rem] shadow-xl max-w-sm w-full space-y-4">
            <div className="flex justify-between items-center border-b border-warm-100 pb-3">
              <h3 className="font-display font-bold text-base text-charcoal-950 flex items-center gap-1.5">
                <MessageSquare size={16} className="text-maroon-600" />
                Select Recipient User
              </h3>
              <button
                onClick={() => setShowNewChatModal(false)}
                className="text-charcoal-500 hover:text-charcoal-700 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Recipient Search input */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-charcoal-400" size={14} />
              <input
                type="text"
                placeholder="Search user name or role..."
                value={newChatSearch}
                onChange={(e) => setNewChatSearch(e.target.value)}
                className="input-luxury text-xs pl-8 py-1.5 h-9 bg-warm-50/50"
              />
            </div>

            {/* Users listing */}
            <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
              {filteredEligibleUsers.length === 0 ? (
                <div className="p-4 text-center text-xs text-charcoal-400 font-semibold">
                  No users found matching requirements.
                </div>
              ) : (
                filteredEligibleUsers.map((u) => {
                  let roleColor = "text-sky-600 bg-sky-50";
                  if (u.role === "COUPLE") roleColor = "text-rose-600 bg-rose-50";
                  else if (u.role === "AGENT") roleColor = "text-emerald-600 bg-emerald-50";
                  else if (u.role === "ADMIN") roleColor = "text-purple-650 bg-purple-50";

                  return (
                    <div
                      key={u.id}
                      onClick={() => handleCreateChat(u.id, u.name || u.email.split("@")[0])}
                      className="p-2 border border-warm-150 rounded-xl hover:bg-warm-50/30 flex items-center justify-between cursor-pointer transition-colors"
                    >
                      <div className="flex gap-2.5 items-center min-w-0">
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-warm-200 flex-shrink-0 relative">
                          <NextImage
                            fill
                            src={u.avatar || "https://i.pravatar.cc/80?img=5"}
                            alt={u.name || "User Avatar"}
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-display font-bold text-xs text-charcoal-900 truncate">
                            {u.name || "User Name"}
                          </h4>
                          <p className="text-[10px] text-charcoal-400 truncate">{u.email}</p>
                        </div>
                      </div>

                      <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded ${roleColor} flex-shrink-0`}>
                        {u.role}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
