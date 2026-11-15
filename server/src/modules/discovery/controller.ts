import type { Request, Response, NextFunction } from 'express';
import { discoverStations, normalizeDiscoveryQuery } from './service.js';

export async function searchStations(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const query = normalizeDiscoveryQuery(req.query as Record<string, unknown>);
    const stations = await discoverStations(query);
    res.json({
      success: true,
      message: 'Stations discovered successfully',
      data: { stations, count: stations.length },
    });
  } catch (error) {
    next(error);
  }
}

export const discoveryController = {
  searchStations,
};

export default discoveryController;
