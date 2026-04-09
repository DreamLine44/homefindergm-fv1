//export const BASE_URL = import.meta.env.VITE_BASE_URL;
export const BASE_URL = import.meta.env.VITE_API_URL;

export const PROPERTY_TYPES = [ 
  "Room", "Self-Contained", "Apartment", "House", "Shop", "Office", "Boys Quarter", "Villa", "Other"
];

export const AMENITIES = [
  "WiFi", "Pool", "Gym", "Parking", "Security", "Generator", "AC", "Garden"
];

export const CITIES = [
  "Banjul", "Serrekunda", "Bakau", "Kololi", "Fajara", "Kanifing", "Brufut", "Sukuta",
  "Busumbala", "Brikama", "Bansang", "Farafenni", "Lamin", "Kerewan"
];

export const REPORT_STATUSES = {
  PENDING: "pending",
  REVIEWED: "reviewed",
  RESOLVED: "resolved",
  DISMISSED: "dismissed",
};

export const USER_ROLES = {
  USER: "user",
  ADMIN: "admin",
};
