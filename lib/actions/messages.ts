"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "../prisma";
import { requireAuth } from "../auth";
import { UserRole, MessageType, NotificationType } from "@prisma/client";
import { realtime } from "../realtime";
import { sendNewMessageEmail } from "../email";
import {
  detectProhibitedContactInfo,
  isContactSharingAllowedForBooking,
} from "../services/contact-moderation";
import { rateLimit } from "../rate-limit";

/**
 * General helper to create a system audit log for messaging events.
 * Bypasses the strict admin requireRole check of default createAuditLog.
 */
async function logMessageAudit(
  action: string,
  entityId: string | null,
  details: string
) {
  try {
    const user = await requireAuth();
    await prisma.auditLog.create({
      data: {
        action,
        entity: "Message",
        entityId,
        userId: user.id,
        userName: user.name || user.email,
        details,
      },
    });
  } catch (error) {
    console.error("Failed to write message audit log:", error);
  }
}

/**
 * Creates a new Conversation or retrieves it if it already exists between participants.
 */
export async function createConversation(
  participantIds: string[],
  bookingId?: string,
  title?: string
) {
  const user = await requireAuth();

  const { success: rateLimitOk } = await rateLimit("createConversation", user.id, { limit: 5, window: 300 });
  if (!rateLimitOk) {
    throw new Error("Too many conversations created. Please wait before trying again.");
  }

  // Normalize participants list to include self
  const uniqueIds = Array.from(new Set([...participantIds, user.id]));

  if (uniqueIds.length < 2) {
    throw new Error("A conversation must have at least 2 participants.");
  }

  // Find existing conversation with exact participant match
  const existing = await prisma.conversation.findFirst({
    where: {
      bookingId: bookingId || null,
      participants: {
        every: {
          userId: { in: uniqueIds },
        },
      },
    },
    include: {
      participants: {
        include: {
          user: true,
        },
      },
    },
  });

  // Verify if it has exactly the same number of participants
  if (existing && existing.participants.length === uniqueIds.length) {
    return existing;
  }

  // Create new conversation
  const conversation = await prisma.conversation.create({
    data: {
      title: title || null,
      bookingId: bookingId || null,
      participants: {
        create: uniqueIds.map((uId) => ({
          userId: uId,
        })),
      },
    },
    include: {
      participants: {
        include: {
          user: true,
        },
      },
    },
  });

  await logMessageAudit("CREATE_CONVERSATION", conversation.id, `Created conversation with ${uniqueIds.length} participants.`);
  revalidatePath("/dashboard/messages");
  return conversation;
}

/**
 * Finds a conversation and ensures the caller is authorized.
 */
export async function findConversation(conversationId: string) {
  const user = await requireAuth();

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      participants: {
        include: {
          user: true,
        },
      },
      messages: {
        where: { deletedAt: null },
        orderBy: { createdAt: "asc" },
        take: 50,
        include: {
          sender: true,
          reactions: {
            include: {
              user: true,
            },
          },
        },
      },
    },
  });

  if (!conversation) {
    throw new Error("Conversation not found.");
  }

  const isParticipant = conversation.participants.some((p) => p.userId === user.id);
  const isAdmin = user.role === UserRole.ADMIN;

  if (!isParticipant && !isAdmin) {
    throw new Error("Forbidden: You are not authorized to view this conversation.");
  }

  return conversation;
}

/**
 * Sends a message into a conversation.
 */
export async function sendMessage(
  conversationId: string,
  text?: string,
  image?: string,
  attachment?: string,
  type: MessageType = MessageType.TEXT
) {
  const user = await requireAuth();

  const { success: rateLimitOk } = await rateLimit("sendMessage", user.id, { limit: 10, window: 60 });
  if (!rateLimitOk) {
    throw new Error("You are sending messages too quickly. Please wait a moment.");
  }

  const { assertCanMessage } = require("./safety");
  await assertCanMessage(user.id);

  // Validate conversation exists and sender is participant
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      booking: true,
      participants: {
        include: {
          user: true,
        },
      },
    },
  });

  if (!conversation) throw new Error("Conversation not found.");

  const isParticipant = conversation.participants.some((p) => p.userId === user.id);
  const isAdmin = user.role === UserRole.ADMIN;

  if (!isParticipant && !isAdmin) {
    throw new Error("Forbidden: You cannot send messages to this conversation.");
  }

  if (conversation.archived) {
    throw new Error("Archived: Cannot send messages into an archived conversation.");
  }

  // Enforce pre-booking contact leak prevention rule if not admin
  if (!isAdmin && text) {
    const isConfirmedBooking = isContactSharingAllowedForBooking(conversation.booking?.status);
    if (!isConfirmedBooking) {
      const contactCheck = detectProhibitedContactInfo(text);
      if (contactCheck.hasProhibitedContact) {
        await logMessageAudit(
          "CONTACT_INFO_BLOCKED",
          conversationId,
          `Blocked off-platform contact sharing attempt: ${contactCheck.detectedTypes.join(", ")}`
        );
        throw new Error(contactCheck.reason);
      }
    }
  }

  // Create message
  const message = await prisma.message.create({
    data: {
      conversationId,
      senderId: user.id,
      text,
      image,
      attachment,
      type,
    },
    include: {
      sender: true,
      reactions: true,
    },
  });

  // Update conversation updatedAt timestamp
  await prisma.conversation.update({
    where: { id: conversationId },
    data: { updatedAt: new Date() },
  });

  // Update sender lastReadAt to now
  await prisma.conversationParticipant.update({
    where: {
      conversationId_userId: {
        conversationId,
        userId: user.id,
      },
    },
    data: { lastReadAt: new Date() },
  });

  // Trigger real-time event
  const senderName = user.name || user.email.split("@")[0];
  await realtime.triggerNewMessage(conversationId, {
    id: message.id,
    conversationId,
    senderId: user.id,
    senderName,
    senderAvatar: user.avatar,
    text: message.text,
    image: message.image,
    attachment: message.attachment,
    type: message.type,
    createdAt: message.createdAt,
  });

  // Create database notifications & send Resend emails for other participants
  const otherParticipants = conversation.participants.filter((p) => p.userId !== user.id);
  for (const participant of otherParticipants) {
    const notifyTitle = `New message from ${senderName}`;
    const summary = text || "Sent an attachment.";

    const dbNotification = await prisma.notification.create({
      data: {
        userId: participant.userId,
        title: notifyTitle,
        message: summary,
        type: NotificationType.NEW_MESSAGE,
      },
    });

    // Real-time dispatch for notifications
    await realtime.triggerNotification(participant.userId, {
      id: dbNotification.id,
      userId: participant.userId,
      title: notifyTitle,
      message: summary,
      type: NotificationType.NEW_MESSAGE,
      createdAt: dbNotification.createdAt,
    });

    // Email alert
    if (participant.user.email) {
      await sendNewMessageEmail(
        participant.user.email,
        senderName,
        conversation.title || "Wedding Chat",
        summary
      );
    }
  }

  revalidatePath("/dashboard/messages");
  return message;
}

/**
 * Edits a message's text.
 */
export async function editMessage(messageId: string, text: string) {
  const user = await requireAuth();

  const message = await prisma.message.findUnique({
    where: { id: messageId },
  });

  if (!message) throw new Error("Message not found.");
  if (message.senderId !== user.id) throw new Error("Unauthorized: Only the sender can edit this message.");

  const updated = await prisma.message.update({
    where: { id: messageId },
    data: {
      text,
      editedAt: new Date(),
    },
  });

  revalidatePath(`/dashboard/messages`);
  return updated;
}

/**
 * Soft deletes a message.
 */
export async function deleteMessage(messageId: string) {
  const user = await requireAuth();

  const message = await prisma.message.findUnique({
    where: { id: messageId },
  });

  if (!message) throw new Error("Message not found.");

  const isOwner = message.senderId === user.id;
  const isAdmin = user.role === UserRole.ADMIN;

  if (!isOwner && !isAdmin) {
    throw new Error("Unauthorized: You cannot delete this message.");
  }

  const updated = await prisma.message.update({
    where: { id: messageId },
    data: {
      deletedAt: new Date(),
    },
  });

  await logMessageAudit("DELETE_MESSAGE", messageId, `Soft deleted message.`);
  revalidatePath(`/dashboard/messages`);
  return updated;
}

/**
 * Marks conversation as read for current user.
 */
export async function markConversationRead(conversationId: string) {
  const user = await requireAuth();

  await prisma.conversationParticipant.update({
    where: {
      conversationId_userId: {
        conversationId,
        userId: user.id,
      },
    },
    data: {
      lastReadAt: new Date(),
    },
  });

  return { success: true };
}

/**
 * Toggles notification mute status for conversation.
 */
export async function toggleMute(conversationId: string) {
  const user = await requireAuth();

  const participant = await prisma.conversationParticipant.findUnique({
    where: {
      conversationId_userId: {
        conversationId,
        userId: user.id,
      },
    },
  });

  if (!participant) throw new Error("Participant not found.");

  const updated = await prisma.conversationParticipant.update({
    where: {
      conversationId_userId: {
        conversationId,
        userId: user.id,
      },
    },
    data: {
      muted: !participant.muted,
    },
  });

  revalidatePath("/dashboard/messages");
  return updated;
}

/**
 * Toggles pinning state.
 */
export async function togglePin(conversationId: string) {
  const user = await requireAuth();

  const participant = await prisma.conversationParticipant.findUnique({
    where: {
      conversationId_userId: {
        conversationId,
        userId: user.id,
      },
    },
  });

  if (!participant) throw new Error("Participant not found.");

  const updated = await prisma.conversationParticipant.update({
    where: {
      conversationId_userId: {
        conversationId,
        userId: user.id,
      },
    },
    data: {
      pinned: !participant.pinned,
    },
  });

  revalidatePath("/dashboard/messages");
  return updated;
}

/**
 * Archives / Unarchives a conversation.
 */
export async function archiveConversation(conversationId: string, archived: boolean = true) {
  const user = await requireAuth();

  // Validate participant or admin
  const participant = await prisma.conversationParticipant.findUnique({
    where: {
      conversationId_userId: {
        conversationId,
        userId: user.id,
      },
    },
  });

  const isAdmin = user.role === UserRole.ADMIN;
  if (!participant && !isAdmin) {
    throw new Error("Unauthorized: You cannot archive this conversation.");
  }

  const updated = await prisma.conversation.update({
    where: { id: conversationId },
    data: { archived },
  });

  await logMessageAudit("ARCHIVE_CONVERSATION", conversationId, `Set archived state to: ${archived}`);
  revalidatePath("/dashboard/messages");
  return updated;
}

/**
 * Uploads an attachment by creating a message with the asset link.
 */
export async function uploadAttachment(conversationId: string, fileUrl: string, type: MessageType) {
  return sendMessage(conversationId, undefined, type === MessageType.IMAGE ? fileUrl : undefined, type === MessageType.FILE ? fileUrl : undefined, type);
}

/**
 * Adds an emoji reaction to a message.
 */
export async function reactToMessage(messageId: string, emoji: string) {
  const user = await requireAuth();

  // Validate message exists
  const message = await prisma.message.findUnique({
    where: { id: messageId },
    include: {
      conversation: {
        include: {
          participants: true,
        },
      },
    },
  });

  if (!message) throw new Error("Message not found.");
  const isParticipant = message.conversation.participants.some((p) => p.userId === user.id);
  if (!isParticipant) throw new Error("Unauthorized: You cannot react to this message.");

  // Check if reaction already exists
  const existing = await prisma.messageReaction.findUnique({
    where: {
      messageId_userId_emoji: {
        messageId,
        userId: user.id,
        emoji,
      },
    },
  });

  if (existing) {
    // Toggle off: remove
    await prisma.messageReaction.delete({
      where: {
        messageId_userId_emoji: {
          messageId,
          userId: user.id,
          emoji,
        },
      },
    });
  } else {
    // Add reaction
    await prisma.messageReaction.create({
      data: {
        messageId,
        userId: user.id,
        emoji,
      },
    });
  }

  // Trigger real-time update
  await realtime.triggerMessageReaction(message.conversationId, {
    messageId,
    userId: user.id,
    emoji,
  });

  revalidatePath("/dashboard/messages");
  return { success: true };
}

/**
 * Fetches message history with cursor pagination.
 */
export async function fetchConversation(conversationId: string, limit: number = 30, cursor?: string) {
  const user = await requireAuth();

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      participants: true,
    },
  });

  if (!conversation) throw new Error("Conversation not found.");

  const isParticipant = conversation.participants.some((p) => p.userId === user.id);
  const isAdmin = user.role === UserRole.ADMIN;
  if (!isParticipant && !isAdmin) {
    throw new Error("Forbidden: You cannot view messages for this conversation.");
  }

  const messages = await prisma.message.findMany({
    where: {
      conversationId,
      deletedAt: null,
    },
    take: limit,
    skip: cursor ? 1 : 0,
    cursor: cursor ? { id: cursor } : undefined,
    orderBy: { createdAt: "desc" },
    include: {
      sender: true,
      reactions: {
        include: {
          user: true,
        },
      },
    },
  });

  return messages.reverse(); // Return in chronological order
}

/**
 * Fetches active or archived conversations for user's inbox list.
 */
export async function fetchInbox(archived: boolean = false) {
  const user = await requireAuth();

  const userConversations = await prisma.conversationParticipant.findMany({
    where: {
      userId: user.id,
      conversation: {
        archived,
      },
    },
    include: {
      conversation: {
        include: {
          participants: {
            include: {
              user: true,
            },
          },
          messages: {
            where: { deletedAt: null },
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      },
    },
    orderBy: {
      conversation: {
        updatedAt: "desc",
      },
    },
  });

  // Calculate dynamic unread counter per conversation
  const inbox = await Promise.all(
    userConversations.map(async (uc) => {
      const unreadCount = await prisma.message.count({
        where: {
          conversationId: uc.conversationId,
          createdAt: { gt: uc.lastReadAt },
          senderId: { not: user.id },
          deletedAt: null,
        },
      });

      return {
        ...uc,
        unreadCount,
      };
    })
  );

  return inbox;
}

/**
 * Fetches total count of unread messages across all active conversations.
 */
export async function fetchUnreadCount() {
  const user = await requireAuth();

  const userConversations = await prisma.conversationParticipant.findMany({
    where: { userId: user.id },
  });

  let totalUnread = 0;
  for (const uc of userConversations) {
    const count = await prisma.message.count({
      where: {
        conversationId: uc.conversationId,
        createdAt: { gt: uc.lastReadAt },
        senderId: { not: user.id },
        deletedAt: null,
      },
    });
    totalUnread += count;
  }

  return totalUnread;
}

/**
 * Fetches other users the current user can start conversations with.
 */
export async function fetchEligibleUsers() {
  const user = await requireAuth();

  const rolesFilter: UserRole[] = [UserRole.ADMIN];
  if (user.role === UserRole.TRAVELER) {
    rolesFilter.push(UserRole.COUPLE, UserRole.AGENT);
  } else if (user.role === UserRole.COUPLE) {
    rolesFilter.push(UserRole.TRAVELER, UserRole.AGENT);
  } else if (user.role === UserRole.AGENT) {
    rolesFilter.push(UserRole.TRAVELER, UserRole.COUPLE);
  } else if (user.role === UserRole.ADMIN) {
    rolesFilter.push(UserRole.TRAVELER, UserRole.COUPLE, UserRole.AGENT);
  }

  const eligible = await prisma.user.findMany({
    where: {
      id: { not: user.id },
      role: { in: rolesFilter },
    },
    orderBy: { name: "asc" },
  });

  return eligible;
}

/**
 * Admin action to fetch and search all system conversations.
 */
export async function adminGetConversations(filters: {
  search?: string;
  status?: "open" | "closed" | "archived";
  assignedAdminId?: string;
}) {
  const user = await requireAuth();
  if (user.role !== UserRole.ADMIN) {
    throw new Error("Forbidden: Admin access only.");
  }

  const conversations = await prisma.conversation.findMany({
    where: {
      archived: filters.status === "archived" ? true : filters.status === "open" ? false : undefined,
      participants: filters.search
        ? {
            some: {
              user: {
                name: { contains: filters.search, mode: "insensitive" },
              },
            },
          }
        : undefined,
    },
    include: {
      participants: {
        include: {
          user: true,
        },
      },
      messages: {
        where: { deletedAt: null },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return conversations;
}
