import React, { useState, useEffect } from 'react';
import { LogOut } from 'lucide-react';
import { authApi } from '../services/apiService';
import { User } from '../types/api';
import { AxiosError } from 'axios';
interface UserProfileProps {
  onLogout: () => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ onLogout }) => {
  const [user, setUser] = useState<User | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    // Load user from localStorage, handle errors gracefully
    try {
      const currentUser = authApi.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
      }
    } catch (error) {
      console.error('Error loading user from localStorage:', error);
    }

    // Try to refresh from API only if we have a token
    if (authApi.isAuthenticated()) {
      const fetchUserProfile = async () => {
        try {
          const profile = await authApi.getProfile();
          if (profile) {
            setUser(profile);
            // Update stored user
            localStorage.setItem('user', JSON.stringify(profile));
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
          // If we get 401, clear the token as it's invalid
          if (error instanceof AxiosError && error.response?.status === 401) {
            authApi.logout();
          }
        }
      };

      fetchUserProfile();
    }
  }, []);

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const handleLogout = () => {
    setShowDropdown(false);
    onLogout();
  };

  // If no user data is available, show a generic user
  const displayName = user?.nombre || "Usuario";
  const displayInitial = displayName.charAt(0).toUpperCase();
  const displayEmail = user?.email || "";
  const displayRole = user?.rol ? (user.rol.charAt(0).toUpperCase() + user.rol.slice(1)) : "Usuario";

  return (
    <div className="relative">
      <button
        className="flex items-center gap-2 text-gray-700 hover:text-indigo-600 focus:outline-none"
        onClick={toggleDropdown}
      >
        <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-white">
          {displayInitial}
        </div>
        <span className="font-medium">{displayName}</span>
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-48 py-2 bg-white rounded-md shadow-xl z-20">
          {displayEmail && (
            <div className="px-4 py-2 text-xs text-gray-400 border-b border-gray-100">
              {displayEmail}
            </div>
          )}
          <div className="px-4 py-2 text-xs font-semibold text-gray-500">
            Rol: {displayRole}
          </div>
          <button
            className="w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-gray-100 flex items-center gap-2"
            onClick={handleLogout}
          >
            <LogOut size={16} />
            <span>Cerrar sesión</span>
          </button>
        </div>
      )}
    </div>
  );
}; 