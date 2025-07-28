const express = require('express');
const prisma = require('../lib/prisma');
const { authenticateToken } = require('../middleware/auth');
const { schemas } = require('../utils/ukValidation');

const router = express.Router();

router.use(authenticateToken);

// Get all clients for a company
router.get('/', async (req, res) => {
  try {
    const { companyId } = req.query;
    
    if (!companyId) {
      return res.status(400).json({ error: 'Company ID required' });
    }

    const clients = await prisma.client.findMany({
      where: { companyId },
      include: {
        invoices: {
          select: {
            id: true,
            total: true,
            invoiceDate: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    res.json({ clients });
  } catch (error) {
    console.error('Get clients error:', error);
    res.status(500).json({ error: 'Failed to get clients' });
  }
});

// Get single client
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const client = await prisma.client.findUnique({
      where: { id },
      include: {
        invoices: {
          orderBy: { invoiceDate: 'desc' }
        }
      }
    });

    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    res.json({ client });
  } catch (error) {
    console.error('Get client error:', error);
    res.status(500).json({ error: 'Failed to get client' });
  }
});

// Create client
router.post('/', async (req, res) => {
  try {
    const { error, value } = schemas.createClient.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const client = await prisma.client.create({
      data: value
    });

    res.status(201).json({
      message: 'Client created successfully',
      client
    });
  } catch (error) {
    console.error('Create client error:', error);
    res.status(500).json({ error: 'Failed to create client' });
  }
});

// Update client
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error, value } = schemas.createClient.validate(req.body);
    
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const client = await prisma.client.update({
      where: { id },
      data: value
    });

    res.json({
      message: 'Client updated successfully',
      client
    });
  } catch (error) {
    console.error('Update client error:', error);
    res.status(500).json({ error: 'Failed to update client' });
  }
});

// Delete client
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if client has invoices
    const clientWithInvoices = await prisma.client.findUnique({
      where: { id },
      include: {
        invoices: {
          select: { id: true }
        }
      }
    });

    if (clientWithInvoices.invoices.length > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete client with existing invoices' 
      });
    }

    await prisma.client.delete({
      where: { id }
    });

    res.json({ message: 'Client deleted successfully' });
  } catch (error) {
    console.error('Delete client error:', error);
    res.status(500).json({ error: 'Failed to delete client' });
  }
});

module.exports = router; 