import { z } from 'zod';
export const createPackageSchema = z.object({ body: z.object({ code: z.string().min(3), origin: z.string(), destination: z.string(), customerName: z.string(), weight: z.number(), assignedDriver: z.string().optional() }) });
export const updatePackageSchema = z.object({ body: z.object({ status: z.enum(['Pendiente','En tránsito','Entregado','Cancelado']).optional(), destination: z.string().optional(), assignedDriver: z.string().optional() }) });
export const paramsSchema = z.object({ params: z.object({ id: z.string() }) });
