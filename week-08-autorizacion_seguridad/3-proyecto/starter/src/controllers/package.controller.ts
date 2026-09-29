import type {
  NextFunction,
  Request,
  Response,
} from 'express';

import { AppError } from '../errors/AppError';
import {
  createPackageSchema,
  paramsSchema,
  updatePackageSchema,
} from '../schemas/package.schema';
import * as packageService from '../services/package.service';

export async function listPackages(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const packages = await packageService.listPackages();

    res.status(200).json({
      success: true,
      data: packages,
    });
  } catch (error) {
    next(error);
  }
}

export async function getPackage(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = paramsSchema.parse(req.params);
    const courierPackage = await packageService.getPackageById(id);

    res.status(200).json({
      success: true,
      data: courierPackage,
    });
  } catch (error) {
    next(error);
  }
}

export async function createPackage(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError(401, 'No autenticado');
    }

    const input = createPackageSchema.parse(req.body);
    const courierPackage = await packageService.createPackage(
      input,
      req.user.id
    );

    res.status(201).json({
      success: true,
      data: courierPackage,
    });
  } catch (error) {
    next(error);
  }
}

export async function updatePackage(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = paramsSchema.parse(req.params);
    const input = updatePackageSchema.parse(req.body);
    const courierPackage = await packageService.updatePackage(id, input);

    res.status(200).json({
      success: true,
      data: courierPackage,
    });
  } catch (error) {
    next(error);
  }
}

export async function deletePackage(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = paramsSchema.parse(req.params);

    await packageService.deletePackage(id);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}