export interface User {
  _id: string;
  email: string;
  username: string;
  role: 'user' | 'admin' | 'serviceProvider';
  createdAt?: string;
  verified?: boolean;
}

export interface AuthToken {
  token: string;
  expiresAt?: string;
}
