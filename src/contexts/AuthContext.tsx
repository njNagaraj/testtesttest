import React, { createContext, useContext, useReducer, useEffect } from 'react';

interface User {
  id: string;
  first_name: string;
  last_name: string;
  email_id: string;
  org_id?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'AUTH_ERROR'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'CLEAR_ERROR' };

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
  loading: false,
  error: null,
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return { ...state, loading: true, error: null };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        loading: false,
        error: null,
      };
    case 'AUTH_ERROR':
      return {
        ...state,
        user: null,
        token: null,
        loading: false,
        error: action.payload,
      };
    case 'AUTH_LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        loading: false,
        error: null,
      };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
};

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (firstName: string, lastName: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Verify token and get user info
      fetchCurrentUser(token);
    }
  }, []);

  const fetchCurrentUser = async (token: string) => {
    try {
      dispatch({ type: 'AUTH_START' });
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: { user: data.user, token },
        });
      } else {
        throw new Error('Invalid token');
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
      localStorage.removeItem('token');
      dispatch({ type: 'AUTH_ERROR', payload: 'Session expired' });
    }
  };

  const login = async (email: string, password: string) => {
    try {
      dispatch({ type: 'AUTH_START' });
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: { user: data.user, token: data.token },
        });
      } else {
        throw new Error(data.error || 'Login failed');
      }
    } catch (error) {
      dispatch({
        type: 'AUTH_ERROR',
        payload: error instanceof Error ? error.message : 'Login failed',
      });
      throw error;
    }
  };

  const register = async (firstName: string, lastName: string, email: string, password: string) => {
    try {
      dispatch({ type: 'AUTH_START' });
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ firstName, lastName, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: { user: data.user, token: data.token },
        });
      } else {
        throw new Error(data.error || 'Registration failed');
      }
    } catch (error) {
      dispatch({
        type: 'AUTH_ERROR',
        payload: error instanceof Error ? error.message : 'Registration failed',
      });
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    dispatch({ type: 'AUTH_LOGOUT' });
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};