import { create } from 'zustand';

type UserStore = {
  profile: Record<string, unknown> | null;
  setProfile: (profile: Record<string, unknown> | null) => void;
};

export const useUserStore = create<UserStore>()((set) => ({
  profile: null,
  setProfile: (profile) => set({ profile }),
}));
