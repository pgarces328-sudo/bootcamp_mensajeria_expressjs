import { Request, Response, NextFunction } from 'express';
import * as svc from '../services/auth.service';
import { registerSchema, loginSchema } from '../schemas/auth.schema';
export const registerCtrl = async (r: Request, res: Response, n: NextFunction) => {
    try {
        const data = registerSchema.parse(r).body; // <--- CAMBIO AQUÍ
        const rslt = await svc.register(data);
        res.status(201).json({success:true, data:rslt});
    } catch(e){ n(e); }
};
export const loginCtrl = async (r: Request, res: Response, n: NextFunction) => {
    try {
        const data = loginSchema.parse(r).body; // <--- CAMBIO AQUÍ
        const rslt = await svc.login(data.email, data.password);
        if (rslt.accessToken) {
            res.cookie('accessToken', rslt.accessToken, { httpOnly: true, secure: false, maxAge: 15 * 60 * 1000 });
        }
        res.json({success: true, data: { user: rslt.user }});
    } catch(e){ n(e); }
};
