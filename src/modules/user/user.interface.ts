export interface IUser {
  id: string;
  username: string;
  email: string;
  phone?: string | null;
  password: string;
  firstName?: string | null;
  lastName?: string | null;
  fullName?: string | null;
  lastLogin?: Date | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  token?: string | null;
}

export interface IUserCreate {
  username: string;
  email: string;
  phone?: string;
  password: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
}

export interface IUserLogin {
  identifier: string; // Can be username, email, or phone
  password: string;
}

export interface IUserUpdate {
  fullName?: string;
  email?: string;
  phone?: string;
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