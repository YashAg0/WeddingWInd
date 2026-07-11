import { logger } from "./logger";

/**
 * Generic Interface for Real-Time Event Dispatching.
 * Decouples the application code from specific SDKs (Pusher, Ably, Supabase, etc.)
 */
export interface RealtimeMessagePayload {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string | null;
  text?: string | null;
  image?: string | null;
  attachment?: string | null;
  type: string;
  createdAt: Date;
}

export interface RealtimeReactionPayload {
  messageId: string;
  userId: string;
  emoji: string;
}

export interface RealtimeNotificationPayload {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  createdAt: Date;
}

export interface RealtimeService {
  triggerNewMessage(conversationId: string, message: RealtimeMessagePayload): Promise<void>;
  triggerMessageReaction(conversationId: string, reaction: RealtimeReactionPayload): Promise<void>;
  triggerNotification(userId: string, notification: RealtimeNotificationPayload): Promise<void>;
}

/**
 * Standard implementation that handles logs and serves as a placeholder.
 * Change imports / initialize Pusher / Ably here for production.
 */
class RealtimeAdapter implements RealtimeService {
  private pusherInstance: any = null;

  constructor() {
    // Drop-in initialization example:
    // if (process.env.PUSHER_APP_ID) {
    //   this.pusherInstance = new Pusher({ ... });
    // }
  }

  async triggerNewMessage(conversationId: string, message: RealtimeMessagePayload): Promise<void> {
    logger.info(`[realtime] Triggering NEW_MESSAGE event on channel: conversation_${conversationId}`, {
      messageId: message.id,
      senderId: message.senderId,
    });
    
    // e.g. this.pusherInstance.trigger(`conversation_${conversationId}`, 'message:new', message);
  }

  async triggerMessageReaction(conversationId: string, reaction: RealtimeReactionPayload): Promise<void> {
    logger.info(`[realtime] Triggering REACTION event on channel: conversation_${conversationId}`, {
      messageId: reaction.messageId,
      userId: reaction.userId,
      emoji: reaction.emoji
    });
    
    // e.g. this.pusherInstance.trigger(`conversation_${conversationId}`, 'message:reaction', reaction);
  }

  async triggerNotification(userId: string, notification: RealtimeNotificationPayload): Promise<void> {
    logger.info(`[realtime] Triggering NOTIFICATION event on channel: user_${userId}`, {
      notificationId: notification.id,
      type: notification.type
    });
    
    // e.g. this.pusherInstance.trigger(`user_${userId}`, 'notification:new', notification);
  }
}

export const realtime = new RealtimeAdapter();
