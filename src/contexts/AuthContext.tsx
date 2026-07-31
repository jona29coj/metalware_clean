import { createContext, useState, useContext, useEffect, ReactNode } from 'react';

interface AuthUser {
  username: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = (username: string, password: string) => {
    // Replace this with your actual authentication logic (e.g., API call)
    // For demonstration, we're using hardcoded credentials
    if (username === 'admin' && password === 'admin') {
      const userData = { username };
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData)); // Save user to localStorage
      return true; // Login successful
    }
    return false; // Login failed
  };

  // Function to handle logout
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user'); // Remove user from localStorage
  };

  // Optional: useEffect to manage user session on page refresh
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // Provide user state and methods to the context consumers
  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the Auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
