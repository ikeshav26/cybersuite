import axios from 'axios';
import { env } from '@/lib/env';

export interface LoginHistory {
  loggedInAt: string;
  ip: string;
  location?: {
    city?: string;
    region?: string;
    country?: string;
  };
  device?: {
    browser?: string;
    os?: string;
  };
  isp?: string;
}

export interface User {
  _id: string;
  email: string;
  username: string;
  name?: string;
  role: 'user' | 'admin' | 'serviceProvider';
  emailVerified?: boolean;
  verified?: boolean;
  createdAt?: string;
  loginHistory?: LoginHistory[];
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  username: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  message?: string;
}

interface RegisterResponse {
  user: User;
  token: string;
  message?: string;
}

export const authService = {
  async login(credentials: { email: string; password: string }): Promise<AuthResponse> {
    const { data } = await axios.post(`${env.API_URL}/auth/login`, credentials, {
      withCredentials: true,
    });
    // Backend wraps response in { success: true, data: {...} }
    const responseData = data.data;
    return {
      user: {
        _id: responseData.user.id,
        email: responseData.user.email,
        username: responseData.user.username,
        name: responseData.user.name,
        role: responseData.user.role,
        emailVerified: responseData.user.emailVerified,
        verified: responseData.user.verified,
        createdAt: responseData.user.createdAt,
        loginHistory: responseData.user.loginHistory,
      },
      token: responseData.token,
      message: responseData.message,
    };
  },

  async register(userData: {
    username: string;
    email: string;
    password: string;
  }): Promise<RegisterResponse> {
    const { data } = await axios.post(`${env.API_URL}/auth/register`, userData, {
      withCredentials: true,
    });
    // Backend wraps response in { success: true, data: {...} }
    const responseData = data.data;
    return {
      user: {
        _id: responseData.user.id,
        email: responseData.user.email,
        username: responseData.user.username,
        name: responseData.user.name,
        role: responseData.user.role,
        emailVerified: responseData.user.emailVerified,
        verified: responseData.user.verified,
        createdAt: responseData.user.createdAt,
        loginHistory: responseData.user.loginHistory,
      },
      token: responseData.token,
      message: responseData.message,
    };
  },

  logout: async (): Promise<void> => {
    await axios.post(`${env.API_URL}/auth/logout`, {}, {
      withCredentials: true,
    });
  },

  getProfile: async (): Promise<AuthResponse['user']> => {
    const res = await axios.get(`${env.API_URL}/users/me`, {
      withCredentials: true,
    });
    // Backend wraps response in { success: true, data: {...} }
    const responseData = res.data.data;
    return {
      _id: responseData.id,
      email: responseData.email,
      username: responseData.username,
      name: responseData.name,
      role: responseData.role,
      emailVerified: responseData.emailVerified,
      verified: responseData.verified,
      createdAt: responseData.createdAt,
      loginHistory: responseData.loginHistory,
    };
  },
};
