import { z } from 'zod';

const mongoIdSchema = z
  .string()
  .regex(
    /^[0-9a-fA-F]{24}$/,
    'El ID de MongoDB no es valido'
  );

const codeSchema = z
  .string()
  .trim()
  .transform((value) => value.toUpperCase())
  .refine(
    (value) => /^ENV-[A-Z0-9-]+$/.test(value),
    {
      message:
        'El codigo debe comenzar con ENV- y usar letras, numeros o guiones',
    }
  );

export const createPackageSchema = z.object({
  body: z
    .object({
      code: codeSchema,

      status: z
        .enum([
          'Pendiente',
          'En transito',
          'Entregado',
          'Cancelado',
        ])
        .default('Pendiente'),

      origin: z
        .string()
        .trim()
        .min(2)
        .max(120),

      destination: z
        .string()
        .trim()
        .min(2)
        .max(120),

      customerName: z
        .string()
        .trim()
        .min(2)
        .max(80),

      weight: z
        .number()
        .positive('El peso debe ser mayor que cero')
        .max(1000),

      assignedDriver: mongoIdSchema.optional(),
    })
    .refine(
      (data) =>
        data.origin.toLowerCase() !==
        data.destination.toLowerCase(),
      {
        message:
          'El origen y el destino deben ser diferentes',
        path: ['destination'],
      }
    ),
});

export const updatePackageSchema = z.object({
  body: z
    .object({
      status: z
        .enum([
          'Pendiente',
          'En transito',
          'Entregado',
          'Cancelado',
        ])
        .optional(),

      origin: z
        .string()
        .trim()
        .min(2)
        .max(120)
        .optional(),

      destination: z
        .string()
        .trim()
        .min(2)
        .max(120)
        .optional(),

      customerName: z
        .string()
        .trim()
        .min(2)
        .max(80)
        .optional(),

      weight: z
        .number()
        .positive()
        .max(1000)
        .optional(),

      assignedDriver: mongoIdSchema.optional(),
    })
    .refine(
      (data) => Object.keys(data).length > 0,
      {
        message:
          'Debes enviar al menos un campo para actualizar',
      }
    ),
});

export const paramsSchema = z.object({
  params: z.object({
    id: mongoIdSchema,
  }),
});

export type CreatePackageInput =
  z.infer<typeof createPackageSchema>['body'];

export type UpdatePackageInput =
  z.infer<typeof updatePackageSchema>['body'];