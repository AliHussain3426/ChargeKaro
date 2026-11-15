// Terminals module
//
// Routes for supplier-owned terminal management.
// Mounted under /api/stations/:stationId/terminals (station ownership enforced upstream)
// and also usable for direct terminal operations when mounted with appropriate middleware.

import { Router } from 'express';
import terminalsController from './controller.js';
import {
  validateCreateTerminal,
  validateUpdateTerminal,
  validateTerminalStatus,
} from './validation.js';

const router = Router({ mergeParams: true });

router.post('/', validateCreateTerminal, terminalsController.createTerminal);
router.get('/', terminalsController.listTerminals);
router.patch('/:terminalId', validateUpdateTerminal, terminalsController.updateTerminal);
router.patch('/:terminalId/status', validateTerminalStatus, terminalsController.updateTerminalStatus);
router.delete('/:terminalId', terminalsController.deleteTerminal);

export default router;
