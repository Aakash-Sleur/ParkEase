import { create } from "zustand";

// Define the possible authentication statuses
type AuthStatus = "authenticated" | "unauthenticated" | "loading";

interface UserState {
  _id: string;
  email: string;
  username: string;
  bio: string;
  phone: string;
  address: string;
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
  authStatus: AuthStatus;
  setUser: (user: Partial<UserState>) => void;
  setAuthStatus: (status: AuthStatus) => void;
  checkAuthFromLocalStorage: () => void;
  resetUser: () => void;
}

const initialState = {
  _id: "",
  email: "",
  username: "",
  bio: "",
  phone: "",
  address: "",
  isAdmin: false,
  createdAt: "",
  updatedAt: "",
  __v: 0,
  authStatus: "unauthenticated" as AuthStatus,
};

export const useUserStore = create<UserState>((set) => ({
  _id: "",
  email: "",
  username: "",
  bio: "",
  phone: "",
  address: "",
  isAdmin: false,
  createdAt: "",
  updatedAt: "",
  __v: 0,
  authStatus: "loading", // Default to loading

  // Function to set user information
  setUser: (user) => set((state) => ({ ...state, ...user })),

  // Function to set authentication status
  setAuthStatus: (status) => set((state) => ({ ...state, authStatus: status })),

  // Check if localStorage has user data and set the auth status accordingly
  checkAuthFromLocalStorage: () => {
    const user = localStorage.getItem("currentUser");
    if (user !== null) {
      const parsedUser = JSON.parse(user);
      set((state) => ({
        ...state,
        ...parsedUser,
        authStatus: "authenticated",
      }));
    } else {
      set((state) => ({ ...state, authStatus: "unauthenticated" }));
    }
  },

  resetUser: () => {
    set(() => ({ ...initialState }));
    localStorage.removeItem("currentUser"); // Optionally clear user data from localStorage
  },
}));
