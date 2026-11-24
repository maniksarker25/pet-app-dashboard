// Backend origin. Override per environment with VITE_API_ORIGIN in a .env file.
const origin = (import.meta.env.VITE_API_ORIGIN || "https://api.sansaland.com").replace(/\/+$/, "");

export const imgUrl = `${origin}/`;
export const url = `${origin}/api/`;

export const getBaseUrl = () => url;

/** Resolves an uploaded file path: S3 URLs are absolute, legacy uploads are relative to the API origin. */
export const getImageUrl = (imagePath) => {
  if (!imagePath) return "";
  if (/^https?:\/\//i.test(imagePath)) return imagePath;
  return `${origin}/${String(imagePath).replace(/\\/g, "/").replace(/^\/+/, "")}`;
};
