import type { Request, Response, NextFunction } from 'express';
import { adminService } from './service.js';

export async function getOverview(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const overview = await adminService.getOverview();
    res.json({ success: true, message: 'Admin overview retrieved successfully', data: { overview } });
  } catch (error) {
    next(error);
  }
}

export async function listUsers(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const users = await adminService.listUsers();
    res.json({ success: true, message: 'Users retrieved successfully', data: { users } });
  } catch (error) {
    next(error);
  }
}

export async function listSuppliers(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const suppliers = await adminService.listSuppliers();
    res.json({ success: true, message: 'Suppliers retrieved successfully', data: { suppliers } });
  } catch (error) {
    next(error);
  }
}

export async function listStations(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const stations = await adminService.listStations();
    res.json({ success: true, message: 'Stations retrieved successfully', data: { stations } });
  } catch (error) {
    next(error);
  }
}

export async function listTerminals(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const terminals = await adminService.listTerminals();
    res.json({ success: true, message: 'Terminals retrieved successfully', data: { terminals } });
  } catch (error) {
    next(error);
  }
}

export async function listBookings(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const bookings = await adminService.listBookings();
    res.json({ success: true, message: 'Bookings retrieved successfully', data: { bookings } });
  } catch (error) {
    next(error);
  }
}

export async function getReports(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const reports = await adminService.getReports();
    res.json({ success: true, message: 'Reports retrieved successfully', data: { reports } });
  } catch (error) {
    next(error);
  }
}

export async function getSettings(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const settings = await adminService.getSettings();
    res.json({ success: true, message: 'Settings retrieved successfully', data: { settings } });
  } catch (error) {
    next(error);
  }
}

export async function updateSettings(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const settings = await adminService.updateSettings(req.body ?? {});
    res.json({ success: true, message: 'Settings updated successfully', data: { settings } });
  } catch (error) {
    next(error);
  }
}

export async function updateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await adminService.updateUserOversight(req.params.userId as string, req.body ?? {});
    res.json({ success: true, message: 'User updated successfully', data: { user } });
  } catch (error) {
    next(error);
  }
}

export async function updateSupplier(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const supplier = await adminService.updateSupplierOversight(req.params.supplierId as string, req.body ?? {});
    res.json({ success: true, message: 'Supplier updated successfully', data: { supplier } });
  } catch (error) {
    next(error);
  }
}

export const adminController = {
  getOverview,
  listUsers,
  listSuppliers,
  listStations,
  listTerminals,
  listBookings,
  getReports,
  getSettings,
  updateSettings,
  updateUser,
  updateSupplier,
};

export default adminController;
