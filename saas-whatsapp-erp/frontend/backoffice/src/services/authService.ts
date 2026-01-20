import api from './api';
import { LoginRequest, RegisterRequest, AuthResponse, UserInfo } from '../types/auth';

const MOCK_USER: UserInfo = {
    id: 'user-123',
    email: 'demo@saas.com',
    firstName: 'Demo',
    lastName: 'User',
    role: 'Admin',
    companyId: 'company-123'
};

export const authService = {
  login: async (data: LoginRequest): Promise<{ data: AuthResponse }> => {
      // Mock Login for Demo/Development
      if (data.email === 'demo@saas.com' && data.password === '123456') {
          return new Promise(resolve => setTimeout(() => resolve({
              data: {
                  token: 'mock-token-' + Date.now(),
                  user: MOCK_USER
              }
          }), 1000));
      }
      return api.post<AuthResponse>('/auth/login', data);
  },
  
  register: (data: RegisterRequest) => api.post<AuthResponse>('/auth/register', data),
  
  getCurrentUser: async () => {
       const token = localStorage.getItem('token');
       if (token?.startsWith('mock-token-')) {
           return new Promise<{ data: UserInfo }>(resolve => 
               setTimeout(() => resolve({ data: MOCK_USER }), 500)
           );
       }
       return api.get<UserInfo>('/auth/me');
  },

  logout: () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  }
};
