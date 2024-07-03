import { create } from "zustand";
import getLabelings from "../services/ApiServices/LabelingServices";

const useLabelingStore = create((set) => ({
  Labelings: [],

  setLabelings: (labelings) => set({ labelings }),

  getLabelings: async function () {
    const labelings = await getLabelings();
    set({ labelings });
  },
}));
