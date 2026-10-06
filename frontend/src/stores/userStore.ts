import { create } from "zustand";
import { api, setDebugDateHeader, getDebugDateHeader } from "@/lib/api";
import { User } from "@/lib/types";

interface UserState {
  user: User | null;
  hearts: number;
  maxHearts: number;
  streak: number;
  xp: number;
  gems: number;
  dailyGoal: number;
  debugDate: string | null;
  isLoading: boolean;
  error: string | null;

  refresh: () => Promise<void>;
  setDebugDate: (dateStr: string | null) => Promise<void>;
  refillHeartsAction: () => Promise<boolean>;
  deductHeart: () => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  hearts: 5,
  maxHearts: 5,
  streak: 0,
  xp: 0,
  gems: 500,
  dailyGoal: 20,
  debugDate: typeof window !== "undefined" ? getDebugDateHeader() : null,
  isLoading: false,
  error: null,

  refresh: async () => {
    set({ isLoading: true, error: null });
    try {
      const user = await api.getMe();
      set({
        user,
        hearts: user.hearts,
        streak: user.streak,
        xp: user.total_xp,
        gems: user.gems,
        dailyGoal: user.daily_goal_xp,
        isLoading: false,
      });
    } catch (err: any) {
      set({ error: err.message || "Failed to fetch user", isLoading: false });
    }
  },

  setDebugDate: async (dateStr: string | null) => {
    setDebugDateHeader(dateStr);
    set({ debugDate: dateStr });
    await get().refresh();
  },

  refillHeartsAction: async () => {
    try {
      const res = await api.refillHearts();
      set({
        hearts: res.hearts,
        gems: res.gems,
      });
      return true;
    } catch {
      return false;
    }
  },

  deductHeart: () => {
    set((state) => ({
      hearts: Math.max(0, state.hearts - 1),
    }));
  },
}));
