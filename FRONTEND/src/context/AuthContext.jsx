import { createContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import toast from "react-hot-toast";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper to safely extract user details from JWT
  function decodeUserFromToken(jwt) {
    try {
      const decoded = jwtDecode(jwt);
      // Check if expired
      const currentTime = Date.now() / 1000;
      if (decoded.exp && decoded.exp < currentTime) {
        return null;
      }
      return {
        email: decoded.sub, // 'sub' is the email in our Spring Boot JWT
        ...decoded,
      };
    } catch (error) {
      return null;
    }
  }

  // Hook to check storage on startup
  useEffect(() => {
    const storedToken = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (storedToken) {
      const decoded = decodeUserFromToken(storedToken);
      if (decoded) {
        setToken(storedToken);
        setUser(decoded);
      } else {
        // Token is invalid or expired, clear it
        localStorage.removeItem("token");
        sessionStorage.removeItem("token");
      }
    }
    setLoading(false);

    // Listener for 401 unauthorized interceptor events
    function handleUnauthorized() {
      logout();
      toast.error("Session expired. Please log in again.");
    }

    window.addEventListener("auth-unauthorized", handleUnauthorized);
    return () => {
      window.removeEventListener("auth-unauthorized", handleUnauthorized);
    };
  }, []);

  function login(jwt, rememberMe = false) {
    const decoded = decodeUserFromToken(jwt);
    if (!decoded) {
      toast.error("Failed to authenticate: Invalid token.");
      return;
    }

    if (rememberMe) {
      localStorage.setItem("token", jwt);
    } else {
      sessionStorage.setItem("token", jwt);
    }

    setToken(jwt);
    setUser(decoded);
  }

  function logout() {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    setToken(null);
    setUser(null);
  }

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        loading,
        isAuthenticated,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;