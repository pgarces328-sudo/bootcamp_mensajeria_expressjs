import { UserModel } from '../models/user.model.js';
export function findByEmail(email: string) { return UserModel.findOne({ email }).select('+password'); }
export function createUser(data: { email: string; password: string; name: string }) { return UserModel.create(data); }