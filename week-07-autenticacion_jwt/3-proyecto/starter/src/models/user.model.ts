import mongoose, { Schema } from 'mongoose'; import bcrypt from 'bcryptjs';
export interface IUser extends Document { name: string; email: string; password: string; role: 'admin'|'driver'; vehiclePlate?: string; comparePassword(c:string): Promise<boolean>; }
const userSchema = new Schema<IUser>({ name: { type: String, required: true }, email: { type: String, required: true, unique: true, lowercase: true }, password: { type: String, required: true, select: false }, role: { type: String, enum: ['admin', 'driver'], default: 'driver' }, vehiclePlate: { type: String } }, { timestamps: true });
userSchema.pre('save', async function(next){ if(!this.isModified('password')) return next(); this.password = await bcrypt.hash(this.password, 10); next(); });
userSchema.methods.comparePassword = async function(c:string){ return bcrypt.compare(c, this.password); };
export const User = mongoose.model<IUser>('User', userSchema);
