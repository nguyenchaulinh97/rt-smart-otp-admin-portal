export const isAuthenticated = () => {
  if (globalThis.window === undefined) return true;
  return localStorage.getItem("auth:loggedIn") === "true";
};
