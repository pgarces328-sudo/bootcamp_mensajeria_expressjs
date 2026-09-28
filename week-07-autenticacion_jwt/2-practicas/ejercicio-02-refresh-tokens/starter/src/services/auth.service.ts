import bcrypt from 'bcrypt';
import { findByEmail, createUser, findByIdWithRefresh, saveRefreshHash, clearRefresh } from '../repositories/users.repo';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { AppError } from '../utils/appError';
import type { RegisterDto, LoginDto } from '../schemas/auth.schema';
function sanitize(user: { _id: unknown; email: string; name: string; role: string }) {
  return { id: String(user._id), email: user.email, name: user.name, role: user.role };
}
export async function registerService(dto: RegisterDto) {
  const exists = await findByEmail(dto.email);
  if (exists) throw new AppError(409, 'Email ya registrado');
  const hashed = await bcrypt.hash(dto.password, 10);
  const user = await createUser({ ...dto, password: hashed });
  const accessToken = signAccessToken({ id: String(user._id), email: user.email, role: user.role });
  const refreshToken = signRefreshToken({ id: String(user._id) });
  await saveRefreshHash(String(user._id), await bcrypt.hash(refreshToken, 10));
  return { user: sanitize(user), accessToken, refreshToken };
}
export async function loginService(dto: LoginDto) {
  const user = await findByEmail(dto.email);
  if (!user) throw new AppError(401, 'Credenciales inválidas');
  const ok = await bcrypt.compare(dto.password, user.password);
  if (!ok) throw new AppError(401, 'Credenciales inválidas');
  const accessToken = signAccessToken({ id: String(user._id), email: user.email, role: user.role });
  const refreshToken = signRefreshToken({ id: String(user._id) });
  await saveRefreshHash(String(user._id), await bcrypt.hash(refreshToken, 10));
  return { user: sanitize(user), accessToken, refreshToken };
}
export async function refreshService(rt: string) {
  if (!rt) throw new AppError(401, 'No refresh token');
  let payload: { id: string };
  try { payload = verifyRefreshToken(rt); }
  catch { throw new AppError(401, 'Refresh token inválido'); }
  const user = await findByIdWithRefresh(payload.id);
  if (!user || !user.refreshToken) throw new AppError(401, 'Refresh token inválido');
  const ok = await bcrypt.compare(rt, user.refreshToken);
  if (!ok) throw new AppError(401, 'Refresh token inválido');
  const na = signAccessToken({ id: String(user._id), email: user.email, role: (user as any).role });
  const nr = signRefreshToken({ id: String(user._id) });
  await saveRefreshHash(String(user._id), await bcrypt.hash(nr, 10));
  return { user: sanitize(user), accessToken: na, refreshToken: nr };
}
export async function logoutService(id: string) {
  await clearRefresh(id);
}