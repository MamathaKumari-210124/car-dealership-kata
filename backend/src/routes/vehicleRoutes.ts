import { Router } from 'express';
import { 
  addVehicle, getVehicles, searchVehicles, updateVehicle, 
  deleteVehicle, purchaseVehicle, restockVehicle, getTransactionHistory 
} from '../controllers/vehicleController';
import { authenticateJWT, requireAdmin } from '../middleware/auth';

const router = Router();

router.use(authenticateJWT);

router.get('/transactions', getTransactionHistory);
router.post('/', addVehicle);
router.get('/', getVehicles);
router.get('/search', searchVehicles);
router.put('/:id', updateVehicle);
router.delete('/:id', requireAdmin, deleteVehicle);
router.post('/:id/purchase', purchaseVehicle);
router.post('/:id/restock', requireAdmin, restockVehicle);

export default router;