import {
  User,
  type IUser,
  type UserDocument,
} from '../models/user.model';

export function findByEmail(
  email: string
): Promise<UserDocument | null> {
  return User.findOne({ email }).exec();
}

export function findByEmailWithPassword(
  email: string
): Promise<UserDocument | null> {
  return User.findOne({ email })
    .select('+password')
    .exec();
}

export function findById(
  id: string
): Promise<UserDocument | null> {
  return User.findById(id).exec();
}

export function findAll(): Promise<UserDocument[]> {
  return User.find().sort({ createdAt: -1 }).exec();
}

export function createUser(
  data: Pick<IUser, 'email' | 'password' | 'name' | 'role'>
): Promise<UserDocument> {
  return User.create(data);
}