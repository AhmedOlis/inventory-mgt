import { User } from '../types';
import { generateId } from '../utils/idGenerator';

const USERS_KEY = 'inventory_users';
const SESSION_KEY = 'inventory_session_user';

export interface UserCredentials {
  email: string;
  password: string; // In a real app, this would be hashed.
}

export interface UserRegistrationData extends UserCredentials {
  name: string;
}

// Internal type that includes password
type StoredUser = User & { password?: string };

const getUsersFromStorage = (): StoredUser[] => {
  try {
    const usersJson = localStorage.getItem(USERS_KEY);
    return usersJson ? JSON.parse(usersJson) : [];
  } catch (e) {
    console.error("Failed to parse users from localStorage", e);
    return [];
  }
};

const saveUsersToStorage = (users: StoredUser[]) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

const omitPassword = (user: StoredUser): User => {
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

export const userService = {
  async register(userData: UserRegistrationData): Promise<User> {
    const users = getUsersFromStorage();
    if (users.some(u => u.email.toLowerCase() === userData.email.toLowerCase())) {
      throw new Error('A user with this email already exists.');
    }
    const newUser: StoredUser = {
      id: generateId(),
      name: userData.name,
      email: userData.email,
      // NOTE: Storing plain text password. In a real app, hash and salt it.
      password: userData.password,
    };
    saveUsersToStorage([...users, newUser]);
    // Automatically log in the user after registration
    localStorage.setItem(SESSION_KEY, JSON.stringify(newUser));
    return omitPassword(newUser);
  },

  async login(credentials: UserCredentials): Promise<User> {
    const users = getUsersFromStorage();
    const user = users.find(u => u.email.toLowerCase() === credentials.email.toLowerCase() && u.password === credentials.password);

    if (!user) {
      throw new Error('Invalid email or password.');
    }
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    return omitPassword(user);
  },

  logout(): void {
    localStorage.removeItem(SESSION_KEY);
  },

  async getCurrentUser(): Promise<User | null> {
    const sessionJson = localStorage.getItem(SESSION_KEY);
    if (!sessionJson) {
      return null;
    }
    try {
        const userInSession: StoredUser = JSON.parse(sessionJson);
        // Let's re-verify from "DB" to ensure user wasn't deleted
        const users = getUsersFromStorage();
        const userExists = users.some(u => u.id === userInSession.id);
        
        if (userExists) {
            return omitPassword(userInSession);
        } else {
            // User doesn't exist anymore, clear session
            this.logout();
            return null;
        }
    } catch (e) {
        console.error("Failed to parse session user from localStorage", e);
        this.logout();
        return null;
    }
  },
};
