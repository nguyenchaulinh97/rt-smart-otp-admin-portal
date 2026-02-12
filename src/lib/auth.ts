export const isAuthenticated = () => {
  if (typeof window === "undefined") return true;
  return localStorage.getItem("auth:loggedIn") === "true";
};
