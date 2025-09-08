import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { UserInterface } from '../service/models/User.model';
import { PermissionsList } from '../service/models/Permission.model';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://traverseb2b.traversia.net';


interface AuthContextType {
  currentUser: UserInterface | null;
  currentPermissionList:string[]
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, phoneNumber: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserInterface | null>(null);
  const [currentPermissionList, setCurrentPermissionsList] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const api = axios.create({
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'text/plain'
    }
  });

  api.interceptors.request.use(
    (config) => {
      const user = localStorage.getItem('user');
      if (user) {
        const { token } = JSON.parse(user);
        if (token && config.headers) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedPermissionList = localStorage.getItem('permissionsList');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
      setCurrentPermissionsList(JSON.parse(storedPermissionList??"[]"));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await api.post(`${API_BASE_URL}/api/Auth/login`, {
        username: email,
        password,
      });
  
      if (response?.data) {
        const userData = response.data;

        const user: UserInterface = { 
          id: userData?.id??0,
          name: userData.username??"",
          email: userData.email??"",
          phoneNumber:userData?.phoneNumber??"",
          isActive:userData?.isActive??false,
          role:userData?.role??'',
          token: userData.token 
        };
        let permissionsList:string[]=[]
        if(userData?.role?.permissions?.length){
          userData?.role?.permissions?.forEach((permissionItem:PermissionsList) => {
            if(permissionItem?.id){
              permissionsList.push(permissionItem?.name??"")
            }
          });

        }

        localStorage.setItem('user', JSON.stringify(user));
         localStorage.setItem('permissionsList', JSON.stringify(permissionsList));
        setCurrentUser(user);
        setCurrentPermissionsList(permissionsList);
        window.location.href ='/admin/dashboard';
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  const register = async (name: string, email: string, phoneNumber: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await api.post('/api/Auth/register', {
        username: name,
        email: email,
        phoneNumber: phoneNumber,
        password: password,
      });

      const userData = response.data;
      const user: UserInterface = {
       id: userData.id.toString(),
          name: userData.username??"",
          email: userData.email??"",
          phoneNumber:userData?.phoneNumber??"",
          isActive:userData?.isActive??false,
          role:userData?.role??'',
          token: userData.token 
      };

      localStorage.setItem('user', JSON.stringify(user));
      setCurrentUser(user);
      
      return; 
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    currentPermissionList,
    isLoading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};