import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from './types';

export const storeUser = async (user: User) => {
  try {
    const existingUsers = await getUsers();
    const updatedUsers = [...existingUsers, user];
    await AsyncStorage.setItem('users', JSON.stringify(updatedUsers));
  } catch (error) {
    console.error('Error storing user:', error);
    throw error;
  }
};

export const getUsers = async (): Promise<User[]> => {
  try {
    const users = await AsyncStorage.getItem('users');
    return users ? JSON.parse(users) : [];
  } catch (error) {
    console.error('Error getting users:', error);
    return [];
  }
};

export const validateUser = async (identifier: string, password: string): Promise<User | undefined> => {
  const users = await getUsers();
  return users.find(user => 
    (user.username === identifier || 
     user.emailOrPhone === identifier) && 
    user.password === password
  );
};