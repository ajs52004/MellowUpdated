// context/AuthContext.tsx
import React, { createContext, useContext, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type User = {
  username: string;
  name: string;
  emailOrPhone: string;
  password: string;
  profileImage: string | null;
};

type AuthContextType = {
  user: User | null;
  signup: (user: User) => Promise<void>;
  login: ({ emailOrPhone, password }: { emailOrPhone: string; password: string }) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const signup = async (newUser: User) => {
    await AsyncStorage.setItem('user', JSON.stringify(newUser));
    setUser(newUser);
  };

  const login = async ({ emailOrPhone, password }: { emailOrPhone: string; password: string }) => {
    const storedUser = await AsyncStorage.getItem('user');
    if (!storedUser) throw new Error('No account found');
    const parsed: User = JSON.parse(storedUser);

    const match =
      (parsed.emailOrPhone === emailOrPhone ||
        parsed.username === emailOrPhone ||
        parsed.name === emailOrPhone) &&
      parsed.password === password;

    if (!match) throw new Error('Invalid credentials');
    setUser(parsed);
  };

  const logout = async () => {
    setUser(null);
    await AsyncStorage.removeItem('user');
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    AsyncStorage.setItem('user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, signup, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// ✅ This is the hook your components should import
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export default AuthContext;
