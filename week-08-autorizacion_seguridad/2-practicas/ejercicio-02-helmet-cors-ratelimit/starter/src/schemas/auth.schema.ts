import { z } from 'zod';

export const registerSchema = z.object({
  email: z
    .string()
    .trim()
    .email('El email no es valido')
    .toLowerCase(),

  password: z
    .string()
    .min(8, 'La contrasena debe tener minimo 8 caracteres'),

  name: z
    .string()
    .trim()
    .min(2, 'El nombre debe tener minimo 2 caracteres')
    .max(80, 'El nombre debe tener maximo 80 caracteres'),

  role: z.enum(['user', 'admin']).default('user'),
});

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email('El email no es valido')
    .toLowerCase(),

  password: z
    .string()
    .min(1, 'La contrasena es obligatoria'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;