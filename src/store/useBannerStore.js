import { create } from 'zustand';

export const useBannerStore = create((set) => ({
    banners: [],
    setBanners: (banners) => set({ banners }),
    addBanner: (banner) => set((state) => ({
        banners: [...state.banners, banner]
    })),
}));
