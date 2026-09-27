import { Package } from '../models/package.model';
export const findAll = () => Package.find().populate('createdBy').populate('assignedDriver');
export const findById = (id:string) => Package.findById(id);
export const create = (d:any) => Package.create(d);
export const update = (id:string, d:any) => Package.findByIdAndUpdate(id, d, {new:true});
export const remove = (id:string) => Package.findByIdAndDelete(id);
export const findByCode = (c:string) => Package.findOne({code:c});
