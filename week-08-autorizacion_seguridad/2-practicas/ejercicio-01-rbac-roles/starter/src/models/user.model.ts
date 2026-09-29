import mongoose, {
  Schema,
  type HydratedDocument,
} from 'mongoose';

export type UserRole = 'user' | 'admin';

export interface IUser {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  createdAt?: Date;
  updatedAt?: Date;
}

export type UserDocument = HydratedDocument<IUser>;

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, 'El email es obligatorio'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, 'La contrasena es obligatoria'],
      minlength: [8, 'Minimo 8 caracteres'],
      select: false,
    },
    name: {
      type: String,
      required: [true, 'El nombre es obligatorio'],
      trim: true,
      minlength: [2, 'Minimo 2 caracteres'],
      maxlength: [80, 'Maximo 80 caracteres'],
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

function hidePrivateFields(
  returnedObject: Record<string, unknown>
): Record<string, unknown> {
  returnedObject.id = String(returnedObject._id);

  delete returnedObject._id;
  delete returnedObject.password;

  return returnedObject;
}

userSchema.set('toJSON', {
  transform: (_document, returnedObject) =>
    hidePrivateFields(
      returnedObject as unknown as Record<string, unknown>
    ),
});

export const User = mongoose.model<IUser>('User', userSchema);