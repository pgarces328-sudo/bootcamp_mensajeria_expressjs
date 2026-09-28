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

export async function getAll(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const packages =
      await packageService.getAll();

    res.status(200).json({
      success: true,
      data: packages,
    });
  } catch (error) {
    next(error);
  }
}

export async function getOne(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const validated =
      paramsSchema.parse({
        params: req.params,
      });

    const courierPackage =
      await packageService.getById(
        validated.params.id
      );

    res.status(200).json({
      success: true,
      data: courierPackage,
    });
  } catch (error) {
    next(error);
  }
}

export async function create(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError(
        401,
        'No autenticado'
      );
    }

    const validated =
      createPackageSchema.parse({
        body: req.body,
      });

    const courierPackage =
      await packageService.create(
        validated.body,
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

export async function update(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const validatedParams =
      paramsSchema.parse({
        params: req.params,
      });

    const validatedBody =
      updatePackageSchema.parse({
        body: req.body,
      });

    const courierPackage =
      await packageService.update(
        validatedParams.params.id,
        validatedBody.body
      );

    res.status(200).json({
      success: true,
      data: courierPackage,
    });
  } catch (error) {
    next(error);
  }
}

export async function remove(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const validated =
      paramsSchema.parse({
        params: req.params,
      });

    await packageService.remove(
      validated.params.id
    );

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}