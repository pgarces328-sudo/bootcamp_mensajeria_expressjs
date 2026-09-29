import bcrypt from 'bcrypt';

import { AppError } from '../errors/AppError';
import type {
  UserDocument,
  UserRole,
} from '../models/user.model';
import { User } from '../models/user.model';
import type {
  LoginInput,
  RegisterInput,
} from '../schemas/auth.schema';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '../utils/jwt';

export interface PublicUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface AuthResult {
  user: PublicUser;
  accessToken: string;
  refreshToken: string;
}

function toPublicUser(
  user: UserDocument
): PublicUser {
  return {
    id: user._id.toString(),
    email: user.email,
    name: user.name,
    role: user.role,
  };
}

async function createTokenPair(
  user: UserDocument
): Promise<{
  accessToken: string;
  refreshToken: string;
}> {
  const userId = user._id.toString();

  const accessToken = signAccessToken(
    userId,
    user.role
  );

  const refreshToken = signRefreshToken(userId);

  const refreshTokenHash = await bcrypt.hash(
    refreshToken,
    10
  );

  await User.findByIdAndUpdate(userId, {
    refreshTokenHash,
  });

  return {
    accessToken,
    refreshToken,
  };
}

export async function register(
  input: RegisterInput
): Promise<PublicUser> {
  const existingUser = await User.findOne({
    email: input.email,
  });

  if (existingUser) {
    throw new AppError(
      409,
      'El email ya esta registrado'
    );
  }

  const passwordHash = await bcrypt.hash(
    input.password,
    10
  );

  const user = await User.create({
    email: input.email,
    password: passwordHash,
    name: input.name,
    role: input.role,
  });

  return toPublicUser(user);
}

export async function login(
  input: LoginInput
): Promise<AuthResult> {
  const user = await User.findOne({
    email: input.email,
  }).select('+password');

  if (!user) {
    throw new AppError(
      401,
      'Credenciales invalidas'
    );
  }

  const passwordIsValid = await bcrypt.compare(
    input.password,
    user.password
  );

  if (!passwordIsValid) {
    throw new AppError(
      401,
      'Credenciales invalidas'
    );
  }

  const tokens = await createTokenPair(user);

  return {
    user: toPublicUser(user),
    ...tokens,
  };
}

export async function getMe(
  userId: string
): Promise<PublicUser> {
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError(
      404,
      'Usuario no encontrado'
    );
  }

  return toPublicUser(user);
}

export async function refreshSession(
  refreshToken: string
): Promise<{
  accessToken: string;
  refreshToken: string;
}> {
  let payload: ReturnType<
    typeof verifyRefreshToken
  >;

  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new AppError(
      401,
      'Refresh token invalido o expirado'
    );
  }

  const user = await User.findById(
    payload.id
  ).select('+refreshTokenHash');

  if (!user?.refreshTokenHash) {
    throw new AppError(
      401,
      'La sesion no es valida'
    );
  }

  const tokenIsValid = await bcrypt.compare(
    refreshToken,
    user.refreshTokenHash
  );

  if (!tokenIsValid) {
    await User.findByIdAndUpdate(
      payload.id,
      { refreshTokenHash: null }
    );

    throw new AppError(
      401,
      'Refresh token reutilizado o invalido'
    );
  }

  return createTokenPair(user);
}

export async function logout(
  refreshToken?: string
): Promise<void> {
  if (!refreshToken) {
    return;
  }

  try {
    const payload = verifyRefreshToken(refreshToken);

    await User.findByIdAndUpdate(
      payload.id,
      { refreshTokenHash: null }
    );
  } catch {
    return;
  }
}