const express = require('express');
const prisma = require('../lib/prisma');
const { authenticateToken } = require('../middleware/auth');
const { schemas } = require('../utils/ukValidation');
const { vatCalculation } = require('../utils/vatCalculation');

const router = express.Router();

router.use(authenticateToken);

// Get all expenses for a company
router.get('/', async (req, res) => {
  try {
    const { companyId } = req.query;
    const { startDate, endDate, category } = req.query;
    
    if (!companyId) {
      return res.status(400).json({ error: 'Company ID required' });
    }

    const whereClause = {
      companyId,
      ...(startDate && endDate && {
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      }),
      ...(category && { category })
    };

    const expenses = await prisma.expense.findMany({
      where: whereClause,
      orderBy: { date: 'desc' }
    });

    // Calculate totals
    const totals = expenses.reduce((acc, expense) => {
      acc.total += expense.amount;
      if (expense.mileage) {
        acc.mileage += expense.mileage;
      }
      return acc;
    }, { total: 0, mileage: 0 });

    res.json({ 
      expenses,
      totals: {
        total: parseFloat(totals.total.toFixed(2)),
        mileage: parseFloat(totals.mileage.toFixed(2))
      }
    });
  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(500).json({ error: 'Failed to get expenses' });
  }
});

// Get single expense
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const expense = await prisma.expense.findUnique({
      where: { id }
    });

    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    res.json({ expense });
  } catch (error) {
    console.error('Get expense error:', error);
    res.status(500).json({ error: 'Failed to get expense' });
  }
});

// Create expense
router.post('/', async (req, res) => {
  try {
    const { error, value } = schemas.createExpense.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { companyId, date, amount, category, description, mileage, vehicleType } = value;

    // Calculate mileage expense if applicable
    let finalAmount = amount;
    if (mileage && vehicleType) {
      const mileageAmount = vatCalculation.calculateMileageExpense(mileage, vehicleType);
      finalAmount = mileageAmount;
    }

    const expense = await prisma.expense.create({
      data: {
        companyId,
        date: new Date(date),
        amount: finalAmount,
        category,
        description,
        mileage,
        vehicleType
      }
    });

    res.status(201).json({
      message: 'Expense created successfully',
      expense
    });
  } catch (error) {
    console.error('Create expense error:', error);
    res.status(500).json({ error: 'Failed to create expense' });
  }
});

// Update expense
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error, value } = schemas.createExpense.validate(req.body);
    
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { companyId, date, amount, category, description, mileage, vehicleType } = value;

    // Calculate mileage expense if applicable
    let finalAmount = amount;
    if (mileage && vehicleType) {
      const mileageAmount = vatCalculation.calculateMileageExpense(mileage, vehicleType);
      finalAmount = mileageAmount;
    }

    const expense = await prisma.expense.update({
      where: { id },
      data: {
        companyId,
        date: new Date(date),
        amount: finalAmount,
        category,
        description,
        mileage,
        vehicleType
      }
    });

    res.json({
      message: 'Expense updated successfully',
      expense
    });
  } catch (error) {
    console.error('Update expense error:', error);
    res.status(500).json({ error: 'Failed to update expense' });
  }
});

// Delete expense
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.expense.delete({
      where: { id }
    });

    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Delete expense error:', error);
    res.status(500).json({ error: 'Failed to delete expense' });
  }
});

// Get expense categories
router.get('/categories/:companyId', async (req, res) => {
  try {
    const { companyId } = req.params;

    const categories = await prisma.expense.groupBy({
      by: ['category'],
      where: { companyId },
      _count: {
        category: true
      },
      _sum: {
        amount: true
      }
    });

    res.json({ categories });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Failed to get categories' });
  }
});

module.exports = router; 