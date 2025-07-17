import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import React, { createContext, useContext, useEffect, useState } from 'react';

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
  login: (creds: { emailOrPhone: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updatedUser: User) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = 'http://10.55.218.119:3001';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      const storedUser = await AsyncStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    };
    loadUser();
  }, []);

  const signup = async (newUser: User) => {
    try {
      const payload = {
        name: newUser.name,
        username: newUser.username,
        emailOrPhone: newUser.emailOrPhone,
        password: newUser.password,
        profileImage: newUser.profileImage || null,
      };
      console.log('📤 Signup Payload:', payload);

      const res = await axios.post(`${API_URL}/signup`, payload);
      console.log('✅ Signup Response:', res.data);

      if (res.data.message === 'User created successfully') {
        const loginRes = await axios.post(`${API_URL}/login`, {
          emailOrPhone: newUser.emailOrPhone,
          password: newUser.password,
        });
        console.log('✅ Auto-login after signup:', loginRes.data);

        const userFromDB = loginRes.data.user;
        await AsyncStorage.setItem('user', JSON.stringify(userFromDB));
        setUser(userFromDB);
      } else {
        throw new Error('Unexpected response from server');
      }
    } catch (err: any) {
      console.error('❌ Signup Error:', err.response?.data || err.message);
      throw new Error(err.response?.data?.message || 'Signup failed');
    }
  };

  const login = async ({ emailOrPhone, password }: { emailOrPhone: string; password: string }) => {
    try {
      console.log('📤 Login Payload:', { emailOrPhone, password });
      const res = await axios.post(`${API_URL}/login`, { emailOrPhone, password });
      console.log('✅ Login Response:', res.data);

      if (!res.data.user) {
        throw new Error('Invalid credentials');
      }

      const userFromDB = res.data.user;
      await AsyncStorage.setItem('user', JSON.stringify(userFromDB));
      setUser(userFromDB);
    } catch (err: any) {
      console.error('❌ Login Error:', err.response?.data || err.message);
      throw new Error(err.response?.data?.message || 'Login failed');
    }
  };

  const logout = async () => {
    setUser(null);
    await AsyncStorage.removeItem('user');
  };

  const updateUser = async (updatedUser: User) => {
    try {
      await axios.post(`${API_URL}/update-profile`, {
        emailOrPhone: updatedUser.emailOrPhone,
        profileImage: updatedUser.profileImage,
      });
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Update failed');
    }
  };

  return (
    <AuthContext.Provider value={{ user, signup, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
};

export default AuthContext;
