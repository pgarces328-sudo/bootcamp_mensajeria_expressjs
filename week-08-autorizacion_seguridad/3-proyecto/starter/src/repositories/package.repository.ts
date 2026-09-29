import { Types } from 'mongoose';

import {
  CourierPackage,
  type PackageStatus,
} from '../models/package.model';

export interface CreatePackageData {
  code: string;
  status: PackageStatus;
  origin: string;
  destination: string;
  customerName: string;
  weight: number;
  createdBy: Types.ObjectId;
  assignedDriver?: Types.ObjectId;
}

export interface UpdatePackageData {
  status?: PackageStatus;
  origin?: string;
  destination?: string;
  customerName?: string;
  weight?: number;
  assignedDriver?: Types.ObjectId;
}

export function findAll() {
  return CourierPackage.find()
    .populate(
      'createdBy',
      'name email role'
    )
    .populate(
      'assignedDriver',
      'name email role'
    )
    .sort({
      createdAt: -1,
    })
    .exec();
}

export function findById(id: string) {
  return CourierPackage.findById(id)
    .populate(
      'createdBy',
      'name email role'
    )
    .populate(
      'assignedDriver',
      'name email role'
    )
    .exec();
}

export function findByCode(code: string) {
  return CourierPackage.findOne({
    code: code.toUpperCase(),
  }).exec();
}

export function createPackage(
  data: CreatePackageData
) {
  return CourierPackage.create(data);
}

export function updateById(
  id: string,
  data: UpdatePackageData
) {
  return CourierPackage.findByIdAndUpdate(
    id,
    data,
    {
      new: true,
      runValidators: true,
    }
  )
    .populate(
      'createdBy',
      'name email role'
    )
    .populate(
      'assignedDriver',
      'name email role'
    )
    .exec();
}

export function deleteById(id: string) {
  return CourierPackage.findByIdAndDelete(
    id
  ).exec();
}