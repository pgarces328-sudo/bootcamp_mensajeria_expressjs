import * as repo from '../repositories/package.repository';
import { AppError } from '../errors/AppError';
export const getAll = () => repo.findAll();
export const getById = async (id:string) => { const p = await repo.findById(id); if(!p) throw new AppError('Paquete no encontrado', 404); return p; };
export const create = async (data:any, uid:string) => { if(await repo.findByCode(data.code)) throw new AppError('Codigo duplicado', 400); return repo.create({...data, createdBy: uid}); };
export const update = async (id:string, data:any) => { await getById(id); return repo.update(id, data); };
export const remove = async (id:string) => { await getById(id); await repo.remove(id); };
