import { useState, useEffect } from 'react';
import { messageService } from '../services/message.service';
import { useAuthStore } from '../store/authStore';

export function useUnreadCount(): number {
  const [count, setCount] = useState(0);
  const { user } = useAuthStore();

  useEffect(() => {
    if (!user) { setCount(0); return; }

    async function fetch() {
      try {
        const res = await messageService.getConversations();
        const total = res.conversations.reduce((sum, c) => sum + c.unreadCount, 0);
        setCount(total);
      } catch {
        // ignore
      }
    }

    fetch();
    const interval = setInterval(fetch, 20000);
    return () => clearInterval(interval);
  }, [user]);

  return count;
}