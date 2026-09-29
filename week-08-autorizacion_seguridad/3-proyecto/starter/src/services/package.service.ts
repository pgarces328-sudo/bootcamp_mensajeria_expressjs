import { Types } from 'mongoose';

import { AppError } from '../errors/AppError';
import { CourierPackage } from '../models/package.model';

export async function listPackages() {
  return CourierPackage.find()
    .sort({ createdAt: -1 })
    .exec();
}

export async function getPackageById(id: string) {
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError(400, 'ID de paquete invalido');
  }

  const courierPackage = await CourierPackage.findById(id).exec();

  if (!courierPackage) {
    throw new AppError(404, 'Paquete no encontrado');
  }

  return courierPackage;
}

export async function createPackage(
  input: {
    code: string;
    status: 'Pendiente' | 'En transito' | 'Entregado' | 'Cancelado';
    origin: string;
    destination: string;
    customerName: string;
    weight: number;
    assignedDriver?: string;
  },
  userId: string
) {
  const existingPackage = await CourierPackage.findOne({
    code: input.code.toUpperCase(),
  }).exec();

  if (existingPackage) {
    throw new AppError(409, 'El codigo del envio ya existe');
  }

  return CourierPackage.create({
    code: input.code,
    status: input.status,
    origin: input.origin,
    destination: input.destination,
    customerName: input.customerName,
    weight: input.weight,
    createdBy: new Types.ObjectId(userId),
    assignedDriver: input.assignedDriver
      ? new Types.ObjectId(input.assignedDriver)
      : undefined,
  });
}

export async function updatePackage(
  id: string,
  input: {
    status?: 'Pendiente' | 'En transito' | 'Entregado' | 'Cancelado';
    origin?: string;
    destination?: string;
    customerName?: string;
    weight?: number;
    assignedDriver?: string;
  }
) {
  await getPackageById(id);

  const updatedPackage = await CourierPackage.findByIdAndUpdate(
    id,
    {
      ...input,
      assignedDriver: input.assignedDriver
        ? new Types.ObjectId(input.assignedDriver)
        : undefined,
    },
    {
      new: true,
      runValidators: true,
    }
  ).exec();

  if (!updatedPackage) {
    throw new AppError(404, 'Paquete no encontrado');
  }

  return updatedPackage;
}

export async function deletePackage(id: string): Promise<void> {
  await getPackageById(id);

  const deletedPackage = await CourierPackage.findByIdAndDelete(id).exec();

  if (!deletedPackage) {
    throw new AppError(404, 'Paquete no encontrado');
  }
}