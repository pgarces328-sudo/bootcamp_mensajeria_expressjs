import type { Request, Response } from 'express';

export function getHealth(
  _req: Request,
  res: Response
): void {
  res.status(200).json({
    success: true,
    service: 'seguridad-helmet-cors-ratelimit',
    status: 'ok',
  });
}

export function getPublicData(
  _req: Request,
  res: Response
): void {
  res.status(200).json({
    success: true,
    message: 'Ruta publica protegida por Helmet y rate limit',
  });
}