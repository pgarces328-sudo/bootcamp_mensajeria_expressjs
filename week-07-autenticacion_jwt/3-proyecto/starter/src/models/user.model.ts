import bcrypt from 'bcrypt';
import mongoose, {
  Schema,
  type HydratedDocument,
  type Model,
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

export interface IUserMethods {
  comparePassword(
    candidatePassword: string
  ): Promise<boolean>;
}

export type UserModel = Model<
  IUser,
  Record<string, never>,
  IUserMethods
>;

export type UserDocument = HydratedDocument<
  IUser,
  IUserMethods
>;

const userSchema = new Schema<
  IUser,
  UserModel,
  IUserMethods
>(
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
      enum: [
        'customer',
        'driver',
        'admin',
      ],
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

userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }

  const alreadyHashed =
    /^\$2[aby]\$\d{2}\$/.test(this.password);

  if (alreadyHashed) {
    return;
  }

  this.password = await bcrypt.hash(
    this.password,
    10
  );
});

userSchema.methods.comparePassword =
  async function (
    candidatePassword: string
  ): Promise<boolean> {
    return bcrypt.compare(
      candidatePassword,
      this.password
    );
  };

function removePrivateFields(
  returnedObject: Record<string, unknown>
): Record<string, unknown> {
  returnedObject.id = String(
    returnedObject._id
  );

  delete returnedObject._id;
  delete returnedObject.password;
  delete returnedObject.refreshTokenHash;
  delete returnedObject.__v;

  return returnedObject;
}

userSchema.set('toJSON', {
  transform: (_document, returnedObject) =>
    removePrivateFields(
      returnedObject as unknown as Record<
        string,
        unknown
      >
    ),
});

userSchema.set('toObject', {
  transform: (_document, returnedObject) =>
    removePrivateFields(
      returnedObject as unknown as Record<
        string,
        unknown
      >
    ),
});

export const User = mongoose.model<
  IUser,
  UserModel
>(
  'User',
  userSchema
);