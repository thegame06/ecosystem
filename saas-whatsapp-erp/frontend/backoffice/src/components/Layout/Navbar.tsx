import React, { useEffect, useState } from 'react';
import { authService } from '../../services/authService';
import { UserInfo } from '../../types/auth';

const Navbar: React.FC = () => {
  const [user, setUser] = useState<UserInfo | null>(null);

  useEffect(() => {
    // In a real app, we might fetch this from a context or store
    // For now, let's try to get it from API or assuming we stored it
    // If not stored, we might need a call to /auth/me
    const fetchUser = async () => {
        try {
            const response = await authService.getCurrentUser();
            setUser(response.data);
        } catch (error) {
            console.error("Failed to fetch user", error);
        }
    };
    fetchUser();
  }, []);

  return (
    <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-end px-8 fixed top-0 right-0 left-64 z-10">
      <div className="flex items-center space-x-4">
        <div className="text-right">
          <p className="text-sm font-medium text-gray-900">
            {user ? `${user.firstName} ${user.lastName}` : 'Usuario'}
          </p>
          <p className="text-xs text-gray-500">
            {user?.role || 'Seller'}
          </p>
        </div>
        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
          {user ? user.firstName[0] : 'U'}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
