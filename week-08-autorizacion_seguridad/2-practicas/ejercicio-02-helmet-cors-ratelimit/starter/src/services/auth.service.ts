import bcrypt from 'bcrypt';

import { AppError } from '../errors/AppError';
import type {
  UserDocument,
  UserRole,
} from '../models/user.model';
import * as usersRepository from '../repositories/users.repository';
import type {
  LoginInput,
  RegisterInput,
} from '../schemas/auth.schema';
import { signAccessToken } from '../utils/jwt';

export interface PublicUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface LoginResult {
  user: PublicUser;
  accessToken: string;
}

function toPublicUser(user: UserDocument): PublicUser {
  return {
    id: user._id.toString(),
    email: user.email,
    name: user.name,
    role: user.role,
  };
}

export async function register(
  input: RegisterInput
): Promise<PublicUser> {
  const existingUser = await usersRepository.findByEmail(
    input.email
  );

  if (existingUser) {
    throw new AppError(409, 'El email ya esta registrado');
  }

  const passwordHash = await bcrypt.hash(input.password, 10);

  const user = await usersRepository.createUser({
    email: input.email,
    password: passwordHash,
    name: input.name,
    role: input.role,
  });

  return toPublicUser(user);
}

export async function login(
  input: LoginInput
): Promise<LoginResult> {
  const user = await usersRepository.findByEmailWithPassword(
    input.email
  );

  if (!user) {
    throw new AppError(401, 'Credenciales invalidas');
  }

  const passwordIsValid = await bcrypt.compare(
    input.password,
    user.password
  );

  if (!passwordIsValid) {
    throw new AppError(401, 'Credenciales invalidas');
  }

  const accessToken = signAccessToken(
    user._id.toString(),
    user.email,
    user.role
  );

  return {
    user: toPublicUser(user),
    accessToken,
  };
}

export async function getMe(
  userId: string
): Promise<PublicUser> {
  const user = await usersRepository.findById(userId);

  if (!user) {
    throw new AppError(404, 'Usuario no encontrado');
  }

  return toPublicUser(user);
}