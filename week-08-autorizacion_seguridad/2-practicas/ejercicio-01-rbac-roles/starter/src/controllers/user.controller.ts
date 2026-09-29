import type { Request, Response } from 'express';

export function getDashboard(
  req: Request,
  res: Response
): void {
  res.status(200).json({
    success: true,
    message: 'Bienvenido al dashboard',
    data: {
      user: req.user,
    },
  });
}

export function getPublicInfo(
  _req: Request,
  res: Response
): void {
  res.status(200).json({
    success: true,
    message: 'Esta ruta es publica y no requiere token',
  });
}