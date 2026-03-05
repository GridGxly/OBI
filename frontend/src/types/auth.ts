export interface User {
  id: string;
  email: string;
  username: string;
  createdAt: string;
  savedSounds: SavedSound[];
}

export interface SavedSound {
  id: string;
  title: string;
  bpm?: number;
  tags: string[];
  year?: number;
  matchPercent?: number;
  savedAt: string;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

export interface SignUpFormData {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}