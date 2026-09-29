import { z } from 'zod';

const mongoIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, 'ID de MongoDB no válido');

export const createPackageSchema = z.object({
  code: z.string().trim().min(3).transform(v => v.toUpperCase()),
  status: z.enum(['Pendiente', 'En transito', 'Entregado', 'Cancelado']).default('Pendiente'),
  origin: z.string().trim().min(2),
  destination: z.string().trim().min(2),
  customerName: z.string().trim().min(2),
  weight: z.number().positive(),
  assignedDriver: mongoIdSchema.optional(),
});

export const updatePackageSchema = z.object({
  status: z.enum(['Pendiente', 'En transito', 'Entregado', 'Cancelado']).optional(),
  origin: z.string().trim().min(2).optional(),
  destination: z.string().trim().min(2).optional(),
  customerName: z.string().trim().min(2).optional(),
  weight: z.number().positive().optional(),
  assignedDriver: mongoIdSchema.optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: 'Debes enviar al menos un campo para actualizar',
});

export const paramsSchema = z.object({
  id: mongoIdSchema,
});

export type CreatePackageInput = z.infer<typeof createPackageSchema>;
export type UpdatePackageInput = z.infer<typeof updatePackageSchema>;