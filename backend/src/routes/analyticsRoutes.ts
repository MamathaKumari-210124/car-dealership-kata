import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateJWT, requireAdmin } from '../middleware/auth'; // Fixed import path

const router = Router();
const prisma = new PrismaClient();

router.use(authenticateJWT);

router.get('/stats', async (_req, res) => {
  try {
    const transactions = await prisma.transaction.findMany();
    const totalRevenue = transactions.reduce((sum, t) => sum + t.price, 0);
    const salesCount = transactions.length;

    // Fixed: changed 'stock' to 'quantity' to match your Prisma schema
    const lowStockCount = await prisma.vehicle.count({
      where: {
        quantity: { lte: 2 }
      }
    });

    return res.json({
      revenue: totalRevenue,
      salesCount,
      lowStockCount
    });
  } catch (error) {
    console.error('Analytics stats error:', error);
    return res.status(500).json({ message: 'Error fetching analytics stats' });
  }
});

export default router;