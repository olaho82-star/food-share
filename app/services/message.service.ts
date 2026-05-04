import { api } from './api';
import { Message } from '../types';

interface ConversationsResponse {
  conversations: {
    listing: { _id: string; title: string; borough: string; status: string; photoUrl: string };
    lastMessage: Message;
    unreadCount: number;
  }[];
}

interface MessagesResponse { messages: Message[] }
interface MessageResponse { message: Message }

export const messageService = {
  getConversations: () => api.get<ConversationsResponse>('/api/messages'),
  getMessages: (listingId: string) => api.get<MessagesResponse>(`/api/messages/${listingId}`),
  sendMessage: (listingId: string, content: string) =>
    api.post<MessageResponse>(`/api/messages/${listingId}`, { content }),
};
