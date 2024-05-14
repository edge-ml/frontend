const useUserStore = create((set) => ({
  user: undefined,
  setUser: (mail, name, id) => {
    set({ mail: mail, name: name, _id: id });
  },
}));

export default useUserStore;
