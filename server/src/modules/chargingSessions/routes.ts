import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth.js';
import { UserRole } from '../../types/index.js';
import controller from './controller.js';
import { validateCompleteSession, validateStartSession } from './validation.js';

const router = Router();
router.use(authenticate);

// Supplier / station worker flows
router.post('/', authorize(UserRole.SUPPLIER), validateStartSession, controller.startSession);
router.get('/supplier', authorize(UserRole.SUPPLIER), controller.listSupplierSessions);
router.get('/supplier/:sessionId', authorize(UserRole.SUPPLIER), controller.getSupplierSession);
router.post('/:sessionId/complete', authorize(UserRole.SUPPLIER), validateCompleteSession, controller.completeSession);

// Customer flows
router.get('/me', authorize(UserRole.CUSTOMER), controller.listCustomerSessions);
router.get('/me/:sessionId', authorize(UserRole.CUSTOMER), controller.getCustomerSession);

// Receipt (customer or supplier owner)
router.get('/:sessionId/receipt', authorize(UserRole.CUSTOMER, UserRole.SUPPLIER, UserRole.ADMIN), controller.getSessionReceipt);

export default router;
