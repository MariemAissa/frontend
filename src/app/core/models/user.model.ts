export interface User {
  _id: string;
  username: string;
  email: string;
  role: 'admin' | 'editor' | 'writer' | 'reader';
  profile: {
    firstName: string;
    lastName: string;
    avatar: string;
    bio: string;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  profile: {
    firstName: string;
    lastName: string;
  };
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
    user: User;
  };

}
