import type {
  NextFunction,
  Request,
  Response,
} from 'express';

import * as authService from '../services/auth.service';

export async function getAllUsers(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const users = await authService.listAllUsers();

    res.status(200).json({
      success: true,
      total: users.length,
      data: users,
    });
  } catch (error) {
    next(error);
  }
}

export function getAdminPanel(
  req: Request,
  res: Response
): void {
  res.status(200).json({
    success: true,
    message: 'Panel exclusivo para administradores',
    data: {
      admin: req.user,
    },
  });
}