import { createContext, useState, useContext, useEffect, ReactNode } from 'react';

interface UserContextValue {
  username: string;
  setUsername: (username: string) => void;
  fetchUsername: () => Promise<void>;
}

export const UserContext = createContext<UserContextValue | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [username, setUsername] = useState('Admin');

  const fetchUsername = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth`, {
        method: 'GET',
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        if (data.username) {
          setUsername(data.username);
          console.log('Username fetched:', data.username);
        } else {
          setUsername('Admin');
        }
      } else {
        setUsername('Admin');
      }
    } catch (error) {
      console.error('Error fetching username:', error);
      setUsername('Admin');
    }
  };

  useEffect(() => {
    fetchUsername();
  }, []);

  return (
    <UserContext.Provider value={{ username, setUsername, fetchUsername }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
