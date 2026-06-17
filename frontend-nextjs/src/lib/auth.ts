import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";

interface JwtPayload {
  sub: string;       // email
  userId: number;
  role: string;
  type: string;
  exp: number;
}

export const saveTokens = (accessToken: string, refreshToken: string) => {
  Cookies.set(ACCESS_TOKEN_KEY, accessToken, { expires: 1 });        // 1 day
  Cookies.set(REFRESH_TOKEN_KEY, refreshToken, { expires: 7 });      // 7 days
};

export const getAccessToken = (): string | undefined => {
  return Cookies.get(ACCESS_TOKEN_KEY);
};

export const getRefreshToken = (): string | undefined => {
  return Cookies.get(REFRESH_TOKEN_KEY);
};

export const clearTokens = () => {
  Cookies.remove(ACCESS_TOKEN_KEY);
  Cookies.remove(REFRESH_TOKEN_KEY);
};

export const decodeToken = (token: string): JwtPayload | null => {
  try {
    return jwtDecode<JwtPayload>(token);
  } catch {
    return null;
  }
};

export const isTokenExpired = (token: string): boolean => {
  const decoded = decodeToken(token);
  if (!decoded) return true;
  return decoded.exp * 1000 < Date.now();
};

export const getUserFromToken = (token: string) => {
  const decoded = decodeToken(token);
  if (!decoded) return null;
  return {
    email: decoded.sub,
    userId: decoded.userId,
    role: decoded.role,
  };
};