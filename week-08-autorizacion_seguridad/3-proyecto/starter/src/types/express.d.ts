import type { UserRole } from '../models/user.model';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string; // <-- Aquí está la corrección
        role: UserRole;
      };
    }
  }
}

export {};