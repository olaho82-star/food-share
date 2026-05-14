import { useEffect } from 'react';
import { messageService } from '../services/message.service';
import { useAuthStore } from '../store/authStore';
import { useMessagesStore } from '../store/messagesStore';

export function useUnreadCount(): number {
  const { user } = useAuthStore();
  const { unreadCount, refetchTrigger, setUnreadCount } = useMessagesStore();

  useEffect(() => {
    if (!user) { setUnreadCount(0); return; }

    async function fetch() {
      try {
        const res = await messageService.getConversations();
        const total = res.conversations.reduce((sum, c) => sum + c.unreadCount, 0);
        setUnreadCount(total);
      } catch {
        // ignore
      }
    }

    fetch();
    const interval = setInterval(fetch, 20000);
    return () => clearInterval(interval);
  }, [user, refetchTrigger]);

  return unreadCount;
}