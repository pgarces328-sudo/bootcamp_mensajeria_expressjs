import { findByEmail, createUser } from '../repositories/users.repository';
import { signAccessToken, signRefreshToken } from '../utils/jwt';
import { AppError } from '../errors/AppError';
import mongoose from 'mongoose';
export const register = async (data:any) => {
    const exists = await findByEmail(data.email);
    if(exists) throw new AppError('Email registrado', 400);
    const user = await createUser(data);
    const userId = String(user._id);
    return { user, accessToken: signAccessToken(userId, user.role), refreshToken: signRefreshToken(userId) };
};
export const login = async (email:string, pass:string) => {
    const user = await findByEmail(email);
    if(!user || !(await user.comparePassword(pass))) throw new AppError('Credenciales invalidas', 401);
    const userId = String(user._id);
    return { user, accessToken: signAccessToken(userId, user.role), refreshToken: signRefreshToken(userId) };
};
