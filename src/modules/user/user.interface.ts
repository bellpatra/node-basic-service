export interface IUser {
  id: string;
  username: string;
  email: string;
  password: string;
  fullName?: string;
  role: 'user' | 'admin';
  lastLogin?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserCreate {
  username: string;
  email: string;
  password: string;
  fullName?: string;
  role?: 'user' | 'admin';
}

export interface IUserLogin {
  username: string;
  password: string;
}

export interface IUserUpdate {
  fullName?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
}

export interface IPasswordReset {
  email: string;
}

export interface IPasswordResetConfirm {
  token: string;
  password: string;
}

export interface IRefreshToken {
  refreshToken: string;
}

export interface IAuthResponse {
  token: string;
  refreshToken: string;
  user: Omit<IUser, 'password'>;
}

export interface IAuthTokens {
  accessToken: string;
  refreshToken: string;
}