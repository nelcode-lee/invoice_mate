const express = require('express');
const prisma = require('../lib/prisma');
const { authenticateToken } = require('../middleware/auth');
const { schemas } = require('../utils/ukValidation');

const router = express.Router();

router.use(authenticateToken);

// Get all companies for user
router.get('/', async (req, res) => {
  try {
    const companies = await prisma.company.findMany({
      orderBy: { name: 'asc' }
    });

    res.json({ companies });
  } catch (error) {
    console.error('Get companies error:', error);
    res.status(500).json({ error: 'Failed to get companies' });
  }
});

// Get single company
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const company = await prisma.company.findUnique({
      where: { id },
      include: {
        clients: true,
        invoices: {
          take: 5,
          orderBy: { invoiceDate: 'desc' }
        }
      }
    });

    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    res.json({ company });
  } catch (error) {
    console.error('Get company error:', error);
    res.status(500).json({ error: 'Failed to get company' });
  }
});

// Create company
router.post('/', async (req, res) => {
  try {
    const { error, value } = schemas.createCompany.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const company = await prisma.company.create({
      data: value
    });

    res.status(201).json({
      message: 'Company created successfully',
      company
    });
  } catch (error) {
    console.error('Create company error:', error);
    res.status(500).json({ error: 'Failed to create company' });
  }
});

// Update company
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error, value } = schemas.createCompany.validate(req.body);
    
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const company = await prisma.company.update({
      where: { id },
      data: value
    });

    res.json({
      message: 'Company updated successfully',
      company
    });
  } catch (error) {
    console.error('Update company error:', error);
    res.status(500).json({ error: 'Failed to update company' });
  }
});

// Delete company
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.company.delete({
      where: { id }
    });

    res.json({ message: 'Company deleted successfully' });
  } catch (error) {
    console.error('Delete company error:', error);
    res.status(500).json({ error: 'Failed to delete company' });
  }
});

module.exports = router; 