// ✅ Base URL (only used for OLD local images)
const BASE = (import.meta.env.VITE_API_URL || "http://localhost:8000")
  .replace("/api", "");

/**
 * ✅ Returns correct image URL
 * - Cloudinary images → returned directly
 * - Old local images → converted to /uploads path
 */
export const getImageUrl = (img) => {
  if (!img) return "";

  // 🔥 Cloudinary / full URL → use directly
  if (img.startsWith("http")) {
    return img;
  }

  // ⚠️ fallback for old local uploads
  const clean = img.replace(/^\/?uploads\//, "");

  return `${BASE}/uploads/${clean}`;
};