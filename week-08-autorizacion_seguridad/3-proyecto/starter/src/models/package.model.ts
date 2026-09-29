import mongoose, {
  Schema,
  type HydratedDocument,
  type Types,
} from 'mongoose';

export type PackageStatus =
  | 'Pendiente'
  | 'En transito'
  | 'Entregado'
  | 'Cancelado';

export interface ICourierPackage {
  code: string;
  status: PackageStatus;
  origin: string;
  destination: string;
  customerName: string;
  weight: number;
  createdBy: Types.ObjectId;
  assignedDriver?: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

export type CourierPackageDocument =
  HydratedDocument<ICourierPackage>;

const packageSchema = new Schema<ICourierPackage>(
  {
    code: {
      type: String,
      required: [true, 'El codigo es obligatorio'],
      unique: true,
      trim: true,
      uppercase: true,
      match: [
        /^ENV-[A-Z0-9-]+$/,
        'El codigo debe comenzar con ENV-',
      ],
    },

    status: {
      type: String,
      enum: [
        'Pendiente',
        'En transito',
        'Entregado',
        'Cancelado',
      ],
      default: 'Pendiente',
    },

    origin: {
      type: String,
      required: [true, 'El origen es obligatorio'],
      trim: true,
      minlength: [2, 'El origen es demasiado corto'],
      maxlength: [120, 'El origen es demasiado largo'],
    },

    destination: {
      type: String,
      required: [true, 'El destino es obligatorio'],
      trim: true,
      minlength: [2, 'El destino es demasiado corto'],
      maxlength: [120, 'El destino es demasiado largo'],
    },

    customerName: {
      type: String,
      required: [true, 'El cliente es obligatorio'],
      trim: true,
      minlength: [2, 'El nombre es demasiado corto'],
      maxlength: [80, 'El nombre es demasiado largo'],
    },

    weight: {
      type: Number,
      required: [true, 'El peso es obligatorio'],
      min: [0.1, 'El peso debe ser mayor que cero'],
      max: [1000, 'El peso maximo es 1000 kg'],
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    assignedDriver: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const CourierPackage =
  mongoose.model<ICourierPackage>(
    'CourierPackage',
    packageSchema
  );