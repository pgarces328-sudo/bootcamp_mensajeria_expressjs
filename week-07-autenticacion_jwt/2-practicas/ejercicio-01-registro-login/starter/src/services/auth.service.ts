import bcrypt from 'bcrypt';
import { findByEmail, createUser } from '../repositories/users.repo.js';
import { signAccessToken } from '../utils/jwt.js';
import { AppError } from '../utils/appError.js';
import type { RegisterDto, LoginDto } from '../schemas/auth.schema.js';

function sanitize(user: { _id: unknown; email: string; name: string; role: string }) {
  return {
    id: String(user._id),
    email: user.email,
    name: user.name,
    role: user.role
  };
}

export async function registerService(dto: RegisterDto) {
  const exists = await findByEmail(dto.email);
  if (exists) throw new AppError(409, 'Email ya registrado');
  const hashed = await bcrypt.hash(dto.password, 10);
  const user = await createUser({ ...dto, password: hashed });
  const token = signAccessToken({
    id: String(user._id),
    email: user.email,
    role: user.role
  });
  return { user: sanitize(user), token };
}

export async function loginService(dto: LoginDto) {
  const user = await findByEmail(dto.email);
  if (!user) throw new AppError(401, 'Credenciales inválidas');
  const ok = await bcrypt.compare(dto.password, user.password);
  if (!ok) throw new AppError(401, 'Credenciales inválidas');
  const token = signAccessToken({
    id: String(user._id),
    email: user.email,
    role: user.role
  });
  return { user: sanitize(user), token };
}