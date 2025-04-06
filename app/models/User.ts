export interface User {
  id: string;
  email: string;
  role: 'admin' | 'user';
  name: string;
  apartmentNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserData {
  email: string;
  role: 'admin' | 'user';
  name: string;
  apartmentNumber?: string;
} 