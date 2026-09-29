import mongoose, {
  Schema,
  type HydratedDocument,
} from 'mongoose';

export type UserRole =
  | 'customer'
  | 'driver'
  | 'admin';

export interface IUser {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  refreshTokenHash?: string | null;
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
      enum: ['customer', 'driver', 'admin'],
      default: 'customer',
    },

    refreshTokenHash: {
      type: String,
      default: null,
      select: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

userSchema.set('toJSON', {
  transform: (_document, returnedObject) => {
    const safeObject =
      returnedObject as unknown as Record<string, unknown>;

    safeObject.id = String(safeObject._id);

    delete safeObject._id;
    delete safeObject.password;
    delete safeObject.refreshTokenHash;
    delete safeObject.__v;

    return safeObject;
  },
});

export const User = mongoose.model<IUser>(
  'User',
  userSchema
);