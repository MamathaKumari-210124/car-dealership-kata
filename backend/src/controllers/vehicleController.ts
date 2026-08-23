import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../middleware/auth';

const prisma = new PrismaClient();

// Replace addVehicle, getVehicles, and searchVehicles with these implementation fixes:

export const addVehicle = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { make, model, category, price, stock, quantity } = req.body;
    
    const vehicleQuantity = Number(stock ?? quantity);
    const vehiclePrice = Number(price);

    if (!make || !model || !category || isNaN(vehiclePrice) || isNaN(vehicleQuantity)) {
      return res.status(400).json({ message: 'Invalid payload or missing required fields' });
    }

    const vehicle = await prisma.vehicle.create({
      data: { 
        make, 
        model, 
        category, 
        price: vehiclePrice, 
        quantity: vehicleQuantity 
      }
    });

    // Spread and attach stock property so the frontend UI displays stock correctly
    return res.status(201).json({ ...vehicle, stock: vehicle.quantity });
  } catch (error) {
    console.error('Add Vehicle Error:', error);
    return res.status(500).json({ message: 'Error adding vehicle' });
  }
};

export const getVehicles = async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const vehicles = await prisma.vehicle.findMany();
    const formatted = vehicles.map(v => ({ ...v, stock: v.quantity }));
    return res.json(formatted);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching vehicles' });
  }
};

export const searchVehicles = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { make, model, category, minPrice, maxPrice } = req.query;
    
    const where: any = {};
    if (make) where.make = { contains: String(make) };
    if (model) where.model = { contains: String(model) };
    if (category) where.category = { contains: String(category) };
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(String(minPrice));
      if (maxPrice) where.price.lte = parseFloat(String(maxPrice));
    }

    const vehicles = await prisma.vehicle.findMany({ where });
    const formatted = vehicles.map(v => ({ ...v, stock: v.quantity }));
    return res.json(formatted);
  } catch (error) {
    return res.status(500).json({ message: 'Error searching vehicles' });
  }
};

export const updateVehicle = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const vehicle = await prisma.vehicle.update({
      where: { id },
      data: req.body
    });
    return res.json(vehicle);
  } catch (error) {
    return res.status(404).json({ message: 'Vehicle not found' });
  }
};

export const deleteVehicle = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    await prisma.vehicle.delete({ where: { id } });
    return res.json({ message: 'Vehicle deleted successfully' });
  } catch (error) {
    return res.status(404).json({ message: 'Vehicle not found' });
  }
};

export const purchaseVehicle = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const userId = req.user?.userId;

    if (!userId) return res.status(401).json({ message: 'User unauthenticated' });

    const vehicle = await prisma.vehicle.findUnique({ where: { id } });

    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    if (vehicle.quantity <= 0) return res.status(400).json({ message: 'Out of stock' });

    // Transactional purchase & audit record creation
    const [updatedVehicle, transaction] = await prisma.$transaction([
      prisma.vehicle.update({
        where: { id },
        data: { quantity: vehicle.quantity - 1 }
      }),
      prisma.transaction.create({
        data: {
          userId,
          vehicleId: id,
          price: vehicle.price
        }
      })
    ]);

    return res.json({ vehicle: updatedVehicle, transaction });
  } catch (error) {
    return res.status(500).json({ message: 'Error processing purchase' });
  }
};

export const getTransactionHistory = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const role = req.user?.role;

    const where = role === 'ADMIN' ? {} : { userId };

    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        user: { select: { email: true } },
        vehicle: { select: { make: true, model: true, category: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.json(transactions);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching transactions' });
  }
};

export const restockVehicle = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const { amount } = req.body;
    const quantityToAdd = amount ? parseInt(amount) : 1;

    const vehicle = await prisma.vehicle.findUnique({ where: { id } });
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });

    const updated = await prisma.vehicle.update({
      where: { id },
      data: { quantity: vehicle.quantity + quantityToAdd }
    });

    return res.json(updated);
  } catch (error) {
    return res.status(500).json({ message: 'Error processing restock' });
  }
};