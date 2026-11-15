import type { Request, Response, NextFunction } from 'express';
import { computeRoute, parseRouteQuery } from './service.js';

export async function getRoute(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const input = parseRouteQuery(req.query as Record<string, unknown>);
    const route = await computeRoute(input);
    res.json({
      success: true,
      message: 'Route computed successfully',
      data: { route },
    });
  } catch (error) {
    next(error);
  }
}

export const routesController = {
  getRoute,
};

export default routesController;
