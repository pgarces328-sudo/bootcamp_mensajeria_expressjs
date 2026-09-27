import { Request, Response, NextFunction } from 'express';
import * as svc from '../services/package.service';
import { createPackageSchema, updatePackageSchema, paramsSchema } from '../schemas/package.schema';
export const getAll = async (r: Request, res: Response, n: NextFunction) => {
    try { res.json({ success: true, data: await svc.getAll() }); } catch(e){ n(e); }
};
export const getOne = async (r: Request, res: Response, n: NextFunction) => {
    try {
        const { id } = paramsSchema.parse(r.params).params;
        res.json({ success: true, data: await svc.getById(id) });
    } catch(e){ n(e); }
};
export const create = async (r: Request, res: Response, n: NextFunction) => {
    try {
        const { body } = createPackageSchema.parse(r);
        const uid = (r as any).user.id;
        res.status(201).json({ success: true, data: await svc.create(body, uid) });
    } catch(e){ n(e); }
};
export const update = async (r: Request, res: Response, n: NextFunction) => {
    try {
        const { id } = paramsSchema.parse(r.params).params;
        const { body } = updatePackageSchema.parse(r);
        res.json({ success: true, data: await svc.update(id, body) });
    } catch(e){ n(e); }
};
export const remove = async (r: Request, res: Response, n: NextFunction) => {
    try {
        const { id } = paramsSchema.parse(r.params).params;
        await svc.remove(id);
        res.status(204).send();
    } catch(e){ n(e); }
};
