import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();
const prisma = new PrismaClient();

router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const totalRevenue = await prisma.transaction.aggregate({
      _sum: { price: true }
    });
    
    const totalSales = await prisma.transaction.count();
    
    const lowStockCount = await prisma.vehicle.count({
      where: { stock: { lte: 2 } }
    });

    res.json({
      revenue: totalRevenue._sum.price || 0,
      salesCount: totalSales,
      lowStockCount: lowStockCount
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

export default router;