// In production (Vercel), set VITE_API_URL to your deployed Railway backend
// URL, e.g. https://findit-backend.up.railway.app/api
export const API = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

export const CATS = ["All","Electronics","ID & Cards","Books","Clothing","Keys","Bags","Accessories","Other"];
export const LOCS = ["Library","Canteen","CS Lab","Physics Lab","Hostel A","Hostel B","Auditorium","Ground","Admin Block","Parking","Other"];
export const EM = {
  "Electronics":"📱",
  "ID & Cards":"🪪",
  "Books":"📚",
  "Clothing":"👕",
  "Keys":"🔑",
  "Bags":"🎒",
  "Accessories":"⌚",
  "Other":"📦"
};