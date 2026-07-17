import { useCallback, useEffect, useState } from "react";

export function useAuthSession() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    const savedUserData = localStorage.getItem("userData");
    const token = localStorage.getItem("jwtToken");
    if (savedUserData && token) {
      setCurrentUser(JSON.parse(savedUserData));
    }
  }, []);

  const clearAuthState = useCallback(() => {
    localStorage.removeItem("jwtToken");
    localStorage.removeItem("userData");
    setCurrentUser(null);
  }, []);

  return {
    currentUser,
    setCurrentUser,
    isAuthModalOpen,
    setIsAuthModalOpen,
    clearAuthState,
  };
}
