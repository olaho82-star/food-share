import { create } from 'zustand';

interface MessagesState {
  unreadCount: number;
  refetchTrigger: number;
  setUnreadCount: (count: number) => void;
  triggerRefetch: () => void;
}

export const useMessagesStore = create<MessagesState>((set) => ({
  unreadCount: 0,
  refetchTrigger: 0,
  setUnreadCount: (unreadCount) => set({ unreadCount }),
  triggerRefetch: () => set((s) => ({ refetchTrigger: s.refetchTrigger + 1 })),
}));