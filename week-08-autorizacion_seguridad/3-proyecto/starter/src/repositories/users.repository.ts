import { User } from '../models/user.model';
export const findByEmail = (e:string) => User.findOne({email:e}).select('+password');
export const createUser = (d:any) => User.create(d);
