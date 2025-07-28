const express = require('express');
const prisma = require('../lib/prisma');
const { authenticateToken } = require('../middleware/auth');
const { schemas } = require('../utils/ukValidation');
const { vatCalculation } = require('../utils/vatCalculation');

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Get all invoices for a company
router.get('/', async (req, res) => {
  try {
    const { companyId } = req.query;
    
    if (!companyId) {
      // Return empty array instead of error for development
      return res.json({ invoices: [] });
    }

    const invoices = await prisma.invoice.findMany({
      where: { companyId },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        lineItems: true
      },
      orderBy: { invoiceDate: 'desc' }
    });

    res.json({ invoices });
  } catch (error) {
    console.error('Get invoices error:', error);
    res.status(500).json({ error: 'Failed to get invoices' });
  }
});

// Get single invoice
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        client: true,
        lineItems: true,
        company: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    res.json({ invoice });
  } catch (error) {
    console.error('Get invoice error:', error);
    res.status(500).json({ error: 'Failed to get invoice' });
  }
});

// Create new invoice
router.post('/', async (req, res) => {
  try {
    const { error, value } = schemas.createInvoice.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { companyId, clientId, invoiceDate, dueDate, description, lineItems } = value;

    // Calculate invoice totals
    const totals = vatCalculation.calculateInvoiceTotals(lineItems);

    // Create invoice with line items in a transaction
    const invoice = await prisma.$transaction(async (tx) => {
      // Create the invoice
      const newInvoice = await tx.invoice.create({
        data: {
          companyId,
          clientId,
          invoiceDate: new Date(invoiceDate),
          dueDate: new Date(dueDate),
          description,
          subtotal: totals.subtotal,
          vat: totals.vat,
          total: totals.total
        }
      });

      // Create line items
      const lineItemsData = lineItems.map(item => {
        const calc = vatCalculation.calculateLineVAT(
          item.quantity,
          item.unitPrice,
          item.vatType
        );

        return {
          invoiceId: newInvoice.id,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          vatType: item.vatType,
          vatAmount: calc.vatAmount,
          lineTotal: calc.lineTotal
        };
      });

      await tx.lineItem.createMany({
        data: lineItemsData
      });

      return newInvoice;
    });

    // Get the complete invoice with line items
    const completeInvoice = await prisma.invoice.findUnique({
      where: { id: invoice.id },
      include: {
        client: true,
        lineItems: true
      }
    });

    res.status(201).json({
      message: 'Invoice created successfully',
      invoice: completeInvoice
    });
  } catch (error) {
    console.error('Create invoice error:', error);
    res.status(500).json({ error: 'Failed to create invoice' });
  }
});

// Update invoice
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error, value } = schemas.createInvoice.validate(req.body);
    
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { companyId, clientId, invoiceDate, dueDate, description, lineItems } = value;

    // Calculate new totals
    const totals = vatCalculation.calculateInvoiceTotals(lineItems);

    // Update invoice and line items in a transaction
    const updatedInvoice = await prisma.$transaction(async (tx) => {
      // Update the invoice
      const invoice = await tx.invoice.update({
        where: { id },
        data: {
          companyId,
          clientId,
          invoiceDate: new Date(invoiceDate),
          dueDate: new Date(dueDate),
          description,
          subtotal: totals.subtotal,
          vat: totals.vat,
          total: totals.total
        }
      });

      // Delete existing line items
      await tx.lineItem.deleteMany({
        where: { invoiceId: id }
      });

      // Create new line items
      const lineItemsData = lineItems.map(item => {
        const calc = vatCalculation.calculateLineVAT(
          item.quantity,
          item.unitPrice,
          item.vatType
        );

        return {
          invoiceId: id,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          vatType: item.vatType,
          vatAmount: calc.vatAmount,
          lineTotal: calc.lineTotal
        };
      });

      await tx.lineItem.createMany({
        data: lineItemsData
      });

      return invoice;
    });

    // Get the complete updated invoice
    const completeInvoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        client: true,
        lineItems: true
      }
    });

    res.json({
      message: 'Invoice updated successfully',
      invoice: completeInvoice
    });
  } catch (error) {
    console.error('Update invoice error:', error);
    res.status(500).json({ error: 'Failed to update invoice' });
  }
});

// Delete invoice
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Delete line items first (due to foreign key constraint)
    await prisma.lineItem.deleteMany({
      where: { invoiceId: id }
    });

    // Delete invoice
    await prisma.invoice.delete({
      where: { id }
    });

    res.json({ message: 'Invoice deleted successfully' });
  } catch (error) {
    console.error('Delete invoice error:', error);
    res.status(500).json({ error: 'Failed to delete invoice' });
  }
});

// Get VAT breakdown for reporting
router.get('/vat-breakdown/:companyId', async (req, res) => {
  try {
    const { companyId } = req.params;
    const { startDate, endDate } = req.query;

    const whereClause = {
      companyId,
      ...(startDate && endDate && {
        invoiceDate: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      })
    };

    const invoices = await prisma.invoice.findMany({
      where: whereClause,
      include: {
        lineItems: true
      },
      orderBy: { invoiceDate: 'asc' }
    });

    const vatBreakdown = vatCalculation.getVATBreakdown(invoices);

    res.json({
      period: { startDate, endDate },
      breakdown: vatBreakdown,
      invoiceCount: invoices.length
    });
  } catch (error) {
    console.error('VAT breakdown error:', error);
    res.status(500).json({ error: 'Failed to get VAT breakdown' });
  }
});

module.exports = router; 