export const ADMIN_ROLES = ["ADMIN", "SUPER_ADMIN"];

/** Reads the (unverified) JWT payload. The server still checks every request. */
export const decodeToken = (token) => {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
        .join(""),
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
};

export const isAdminToken = (token) => ADMIN_ROLES.includes(decodeToken(token || "")?.role);

/** Removes data older dashboard builds kept in localStorage (incl. a plain-text "remember me" password). */
export const cleanupLegacyStorage = () => {
  try {
    ["persist:BAZARYA-app", "rememberPassword", "accessToken"].forEach((k) => localStorage.removeItem(k));
  } catch {
    /* storage unavailable */
  }
};
