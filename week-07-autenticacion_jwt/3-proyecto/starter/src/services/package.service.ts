import { Types } from 'mongoose';

import { AppError } from '../errors/AppError';
import * as packageRepository from '../repositories/package.repository';
import type {
  CreatePackageInput,
  UpdatePackageInput,
} from '../schemas/package.schema';

function validateId(id: string): void {
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError(
      400,
      'El ID del paquete no es valido'
    );
  }
}

export function getAll() {
  return packageRepository.findAll();
}

export async function getById(id: string) {
  validateId(id);

  const courierPackage =
    await packageRepository.findById(id);

  if (!courierPackage) {
    throw new AppError(
      404,
      'Paquete no encontrado'
    );
  }

  return courierPackage;
}

export async function create(
  input: CreatePackageInput,
  userId: string
) {
  validateId(userId);

  const existingPackage =
    await packageRepository.findByCode(input.code);

  if (existingPackage) {
    throw new AppError(
      409,
      'El codigo del envio ya existe'
    );
  }

  return packageRepository.createPackage({
    code: input.code,
    status: input.status,
    origin: input.origin,
    destination: input.destination,
    customerName: input.customerName,
    weight: input.weight,
    createdBy: new Types.ObjectId(userId),

    assignedDriver: input.assignedDriver
      ? new Types.ObjectId(
          input.assignedDriver
        )
      : undefined,
  });
}

export async function update(
  id: string,
  input: UpdatePackageInput
) {
  const currentPackage =
    await getById(id);

  const nextOrigin =
    input.origin ?? currentPackage.origin;

  const nextDestination =
    input.destination ??
    currentPackage.destination;

  if (
    nextOrigin.toLowerCase() ===
    nextDestination.toLowerCase()
  ) {
    throw new AppError(
      400,
      'El origen y el destino deben ser diferentes'
    );
  }

  const {
    assignedDriver,
    ...packageFields
  } = input;

  const updatedPackage =
    await packageRepository.updateById(id, {
      ...packageFields,

      ...(assignedDriver
        ? {
            assignedDriver:
              new Types.ObjectId(
                assignedDriver
              ),
          }
        : {}),
    });

  if (!updatedPackage) {
    throw new AppError(
      404,
      'Paquete no encontrado'
    );
  }

  return updatedPackage;
}

export async function remove(
  id: string
): Promise<void> {
  validateId(id);

  const deletedPackage =
    await packageRepository.deleteById(id);

  if (!deletedPackage) {
    throw new AppError(
      404,
      'Paquete no encontrado'
    );
  }
}