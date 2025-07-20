import React, { createContext, useContext, useReducer, useEffect, useRef, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';

const USER_STORAGE_KEY = '@user_data';

interface UserState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

type UserAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'LOGOUT' };

interface UserContextType extends UserState {
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
}

const initialState: UserState = {
  user: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,
};

const userReducer = (state: UserState, action: UserAction): UserState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_USER':
      return { 
        ...state, 
        user: action.payload, 
        isAuthenticated: !!action.payload,
        isLoading: false,
        error: null 
      };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'LOGOUT':
      return { ...initialState, isLoading: false };
    default:
      return state;
  }
};

const UserContext = createContext<UserContextType | undefined>(undefined);

// Safe default user data
const getDefaultUser = (): User => ({
  id: '1',
  username: 'luna_mystic',
  avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150',
  bio: 'Exploring the mysteries of the night ✨',
  location: 'Los Angeles, CA',
  age: 24,
  isHost: true,
  hourlyRate: 200,
  totalChats: 156,
  responseTime: '5 min',
  isFollowing: false,
});

// Validate user data structure
const isValidUser = (data: any): data is User => {
  return (
    data &&
    typeof data === 'object' &&
    typeof data.id === 'string' &&
    typeof data.username === 'string' &&
    typeof data.avatar === 'string'
  );
};

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(userReducer, initialState);
  const isMountedRef = useRef(true);

  // Load user data on app start
  useEffect(() => {
    isMountedRef.current = true;
    loadUserData();
    
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const loadUserData = async () => {
    try {
      if (isMountedRef.current) {
        dispatch({ type: 'SET_LOADING', payload: true });
      }
      
      const storedUserData = await AsyncStorage.getItem(USER_STORAGE_KEY);
      
      if (storedUserData && storedUserData !== 'null' && storedUserData !== 'undefined') {
        try {
          const parsedUser = JSON.parse(storedUserData);
          
          if (isValidUser(parsedUser)) {
            if (isMountedRef.current) {
              dispatch({ type: 'SET_USER', payload: parsedUser });
            }
            return;
          }
        } catch (parseError) {
          console.error('Error parsing stored user data:', parseError);
          // Clear corrupt data to prevent future crashes
          try {
            await AsyncStorage.removeItem(USER_STORAGE_KEY);
          } catch (clearError) {
            console.error('Error clearing corrupt user data:', clearError);
          }
        }
      }
      
      // No valid stored user data
      if (isMountedRef.current) {
        dispatch({ type: 'SET_USER', payload: null });
      }
      
    } catch (error) {
      console.error('Error loading user data:', error);
      if (isMountedRef.current) {
        dispatch({ type: 'SET_ERROR', payload: 'Failed to load user data' });
        dispatch({ type: 'SET_USER', payload: null });
      }
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      if (isMountedRef.current) {
        dispatch({ type: 'SET_LOADING', payload: true });
        dispatch({ type: 'SET_ERROR', payload: null });
      }

      // Validate input
      if (!email?.trim() || !password?.trim()) {
        if (isMountedRef.current) {
          dispatch({ type: 'SET_ERROR', payload: 'Email and password are required' });
        }
        return false;
      }

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Create safe user data
      const userData = getDefaultUser();
      
      // Store user data safely
      try {
        await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
        if (isMountedRef.current) {
          dispatch({ type: 'SET_USER', payload: userData });
        }
        return true;
      } catch (storageError) {
        console.error('Failed to store user data:', storageError);
        if (isMountedRef.current) {
          dispatch({ type: 'SET_ERROR', payload: 'Failed to save login data' });
        }
        return false;
      }
      
    } catch (error) {
      console.error('Login error:', error);
      if (isMountedRef.current) {
        dispatch({ type: 'SET_ERROR', payload: 'Login failed. Please try again.' });
      }
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(USER_STORAGE_KEY);
      if (isMountedRef.current) {
        dispatch({ type: 'LOGOUT' });
      }
    } catch (error) {
      console.error('Logout error:', error);
      if (isMountedRef.current) {
        dispatch({ type: 'SET_ERROR', payload: 'Logout failed' });
      }
    }
  };

  const updateUser = async (userData: Partial<User>): Promise<void> => {
    try {
      if (!state.user) return;
      
      const updatedUser = { ...state.user, ...userData };
      
      if (isValidUser(updatedUser)) {
        await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
        if (isMountedRef.current) {
          dispatch({ type: 'SET_USER', payload: updatedUser });
        }
      }
    } catch (error) {
      console.error('Update user error:', error);
      if (isMountedRef.current) {
        dispatch({ type: 'SET_ERROR', payload: 'Failed to update user data' });
      }
    }
  };

  const value: UserContextType = {
    ...state,
    login,
    logout,
    updateUser,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};