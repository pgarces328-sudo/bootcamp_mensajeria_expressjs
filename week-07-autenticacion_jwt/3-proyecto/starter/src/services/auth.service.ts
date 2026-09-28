import bcrypt from 'bcrypt';
import { AppError } from '../errors/AppError';
import { User } from '../models/user.model';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt';

export async function register(input: any) {
  const existingUser = await User.findOne({ email: input.email });
  if (existingUser) throw new AppError(409, 'El email ya esta registrado');

  const passwordHash = await bcrypt.hash(input.password, 10);
  const user = await User.create({
    email: input.email,
    password: passwordHash,
    name: input.name,
    role: 'driver',
  });

  return { id: user._id.toString(), email: user.email, name: user.name, role: user.role };
}

export async function login(input: any) {
  const user = await User.findOne({ email: input.email }).select('+password');
  if (!user) throw new AppError(401, 'Credenciales invalidas');

  const validPassword = await bcrypt.compare(input.password, user.password);
  if (!validPassword) throw new AppError(401, 'Credenciales invalidas');

  const userId = user._id.toString();
  
  // AQUÍ ESTÁ EL ARREGLO: Pasamos dos parámetros siempre
  const accessToken = signAccessToken(userId, user.role);
  const refreshToken = signRefreshToken(userId);

  const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
  await User.findByIdAndUpdate(userId, { refreshTokenHash });

  return {
    user: { id: userId, email: user.email, name: user.name, role: user.role },
    accessToken,
    refreshToken,
  };
}

export async function getMe(userId: string) {
  const user = await User.findById(userId);
  if (!user) throw new AppError(404, 'Usuario no encontrado');
  return { id: user._id.toString(), email: user.email, name: user.name, role: user.role };
}

export async function refreshSession(currentRefreshToken: string) {
  let tokenData: any;
  try {
    tokenData = verifyRefreshToken(currentRefreshToken);
  } catch {
    throw new AppError(401, 'Refresh token invalido o expirado');
  }

  const userId = tokenData.userId || tokenData.id;
  const user = await User.findById(userId).select('+refreshTokenHash');
  if (!user?.refreshTokenHash) throw new AppError(401, 'La sesion no es valida');

  const isValid = await bcrypt.compare(currentRefreshToken, user.refreshTokenHash);
  if (!isValid) {
    await User.findByIdAndUpdate(userId, { refreshTokenHash: null });
    throw new AppError(401, 'Refresh token reutilizado o invalido');
  }

  // AQUÍ ESTÁ EL ARREGLO: Pasamos dos parámetros siempre
  const accessToken = signAccessToken(userId, user.role);
  const refreshToken = signRefreshToken(userId);

  const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
  await User.findByIdAndUpdate(userId, { refreshTokenHash });

  return { accessToken, refreshToken };
}

export async function logout(currentRefreshToken: string) {
  try {
    const tokenData: any = verifyRefreshToken(currentRefreshToken);
    const userId = tokenData.userId || tokenData.id;
    await User.findByIdAndUpdate(userId, { refreshTokenHash: null });
  } catch {
    return;
  }
}