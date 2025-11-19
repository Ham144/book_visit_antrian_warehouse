export const refreshTokenOption = {
  httpOnly: true,
  secure: false,
  sameSite: 'lax' as const,
  path: '/api/user/refresh-token',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export const accessTokenOption = {
  httpOnly: true,
  secure: false,
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 10 * 60 * 1000,
};
