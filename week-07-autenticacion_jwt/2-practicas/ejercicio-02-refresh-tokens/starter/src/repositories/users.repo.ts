import { UserModel } from '../models/user.model';
export function findByEmail(email: string) {
  return UserModel.findOne({ email }).select('+password');
}
export function findByIdWithRefresh(id: string) {
  return UserModel.findById(id).select('+refreshToken');
}
export function createUser(data: { email: string; password: string; name: string }) {
  return UserModel.create(data);
}
export function saveRefreshHash(id: string, hash: string) {
  return UserModel.findByIdAndUpdate(id, { refreshToken: hash });
}
export function clearRefresh(id: string) {
  return UserModel.findByIdAndUpdate(id, { $unset: { refreshToken: 1 } });
}