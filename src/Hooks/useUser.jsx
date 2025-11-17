import create from "zustand";

const useUserStore = create((set) => ({
  user: undefined,
  setUser: (user) => set({ user: user }),
}));

export default useUserStore;
