export const formatPrice = (price) => {
  if (!price) return "Price on request";
  return new Intl.NumberFormat("en-GM", {
    style: "currency",
    currency: "GMD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

export const formatPriceCompact = (price) => {
  if (!price) return "D 0";
  if (price >= 1_000_000_000) return `D ${(price / 1_000_000_000).toFixed(1)}B`;
  if (price >= 1_000_000)     return `D ${(price / 1_000_000).toFixed(1)}M`;
  if (price >= 1_000)         return `D ${(price / 1_000).toFixed(0)}K`;
  return `D ${price}`;
};

export const formatDate = (dateString) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });
};

export const timeAgo = (dateString) => {
  const now  = new Date();
  const date = new Date(dateString);
  const diff = Math.floor((now - date) / 1000);
  if (diff < 60)     return `${diff}s ago`;
  if (diff < 3600)   return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400)  return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return formatDate(dateString);
};

export const truncate = (str, length = 100) => {
  if (!str) return "";
  return str.length > length ? str.substring(0, length) + "..." : str;
};

export const getInitials = (name) => {
  if (!name) return "U";
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 2);
};

export const classNames = (...classes) => classes.filter(Boolean).join(" ");

/** Resolve a person object (reporter / author / user) to a display name */
export const resolvePersonName = (person) => {
  if (!person) return null;
  // Populated object
  if (typeof person === "object") {
    if (person.firstName) return `${person.firstName} ${person.lastName || ""}`.trim();
    if (person.username)  return `@${person.username}`;
    if (person.email)     return person.email.split("@")[0];
  }
  // Plain string ID — shorten it
  if (typeof person === "string" && person.length >= 6) return `User #${person.slice(-5)}`;
  return null;
};
