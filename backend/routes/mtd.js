const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { requirePremium } = require('../middleware/premium');

// Helper functions
function getQuarterDates(quarter, year) {
  const quarters = {
    1: { start: `${year}-01-01`, end: `${year}-03-31` },
    2: { start: `${year}-04-01`, end: `${year}-06-30` },
    3: { start: `${year}-07-01`, end: `${year}-09-30` },
    4: { start: `${year}-10-01`, end: `${year}-12-31` }
  };
  return quarters[quarter] || quarters[1];
}

function getNextQuarterDueDate(quarter, year) {
  const dueDates = {
    1: `${year}-05-07`,
    2: `${year}-08-07`,
    3: `${year}-11-07`,
    4: `${parseInt(year) + 1}-02-07`
  };
  return dueDates[quarter] || dueDates[1];
}

function getBusinessRequirements(businessType) {
  const requirements = {
    'sole-trader': {
      title: 'Sole Trader Requirements',
      description: 'MTD for Income Tax (from April 2026)',
      reports: [
        'Quarterly income and expense summaries',
        'Annual Self Assessment return',
        'VAT returns (if VAT registered)'
      ],
      frequency: 'Quarterly + Annual',
      notes: 'Currently preparing for MTD for Income Tax'
    },
    'partnership': {
      title: 'Partnership Requirements',
      description: 'MTD for Income Tax (from April 2026)',
      reports: [
        'Quarterly income and expense summaries',
        'Partnership tax return (SA800)',
        'Individual partner returns',
        'VAT returns (if VAT registered)'
      ],
      frequency: 'Quarterly + Annual',
      notes: 'Currently preparing for MTD for Income Tax'
    },
    'limited-company': {
      title: 'Limited Company Requirements',
      description: 'Corporation Tax (not yet MTD)',
      reports: [
        'Annual accounts and CT600 return',
        'VAT returns (if VAT registered)',
        'PAYE returns (if employing staff)'
      ],
      frequency: 'Annual + Quarterly VAT',
      notes: 'Corporation Tax MTD not yet implemented'
    },
    'vat-registered': {
      title: 'VAT Registered Business',
      description: 'MTD for VAT (mandatory since April 2019)',
      reports: [
        'Quarterly VAT returns (VAT3)',
        'Digital record keeping',
        'VAT reconciliation reports'
      ],
      frequency: 'Quarterly',
      notes: 'MTD for VAT is mandatory for all VAT registered businesses'
    }
  };
  
  return requirements[businessType] || requirements['sole-trader'];
}

// MTD Quarterly Reporting Routes (Premium Feature)
router.get('/quarterly-summary', requirePremium, async (req, res) => {
  try {
    const { quarter, year, businessType } = req.query;
    
    // Calculate quarter dates
    const quarterDates = getQuarterDates(quarter, year);
    
    // Mock data - in real app, this would come from database
    const quarterlyData = {
      quarter: quarter,
      year: year,
      businessType: businessType,
      period: `${quarterDates.start} to ${quarterDates.end}`,
      revenue: {
        total: 15420.50,
        vat: 3084.10,
        net: 12336.40,
        invoices: 23
      },
      expenses: {
        total: 8234.75,
        vat: 1646.95,
        net: 6587.80,
        categories: {
          'Travel & Mileage': 2340.00,
          'Office Supplies': 1560.25,
          'Equipment': 2890.50,
          'Professional Services': 1444.00
        }
      },
      vatReturn: {
        vatDue: 1437.15, // Revenue VAT - Expense VAT
        vatReclaimed: 1646.95,
        netVat: -209.80, // Refund due
        totalSales: 15420.50,
        totalPurchases: 8234.75
      },
      profitLoss: {
        grossProfit: 12336.40 - 6587.80,
        netProfit: 5748.60,
        profitMargin: 46.6
      },
      // Business type specific requirements
      requirements: getBusinessRequirements(businessType)
    };
    
    res.json(quarterlyData);
  } catch (error) {
    console.error('MTD quarterly summary error:', error);
    res.status(500).json({ error: 'Failed to generate quarterly summary' });
  }
});

router.get('/vat-return', requirePremium, async (req, res) => {
  try {
    const { quarter, year } = req.query;
    
    // Generate VAT return data for HMRC
    const vatReturn = {
      period: `${quarter} ${year}`,
      vat3: {
        box1: 3084.10, // VAT due on sales
        box2: 0, // VAT due on acquisitions
        box3: 3084.10, // Total VAT due
        box4: 1646.95, // VAT reclaimed on purchases
        box5: 1437.15, // Net VAT to pay/reclaim
        box6: 15420.50, // Total value of sales
        box7: 12336.40, // Total value of purchases
        box8: 0, // Total value of supplies
        box9: 0 // Total value of acquisitions
      },
      summary: {
        totalSales: 15420.50,
        totalPurchases: 8234.75,
        vatDue: 3084.10,
        vatReclaimed: 1646.95,
        netVat: 1437.15
      }
    };
    
    res.json(vatReturn);
  } catch (error) {
    console.error('VAT return error:', error);
    res.status(500).json({ error: 'Failed to generate VAT return' });
  }
});

router.get('/expense-breakdown', requirePremium, async (req, res) => {
  try {
    const { quarter, year } = req.query;
    
    const expenseBreakdown = {
      period: `${quarter} ${year}`,
      categories: [
        {
          name: 'Travel & Mileage',
          amount: 2340.00,
          vat: 468.00,
          net: 1872.00,
          percentage: 28.4
        },
        {
          name: 'Office Supplies',
          amount: 1560.25,
          vat: 312.05,
          net: 1248.20,
          percentage: 18.9
        },
        {
          name: 'Equipment',
          amount: 2890.50,
          vat: 578.10,
          net: 2312.40,
          percentage: 35.1
        },
        {
          name: 'Professional Services',
          amount: 1444.00,
          vat: 288.80,
          net: 1155.20,
          percentage: 17.6
        }
      ],
      total: {
        amount: 8234.75,
        vat: 1646.95,
        net: 6587.80
      }
    };
    
    res.json(expenseBreakdown);
  } catch (error) {
    console.error('Expense breakdown error:', error);
    res.status(500).json({ error: 'Failed to generate expense breakdown' });
  }
});

router.post('/submit-vat-return', requirePremium, async (req, res) => {
  try {
    const { quarter, year, vatData } = req.body;
    
    // In real app, this would submit to HMRC API
    // For now, we'll simulate submission
    
    const submission = {
      id: `VAT-${year}-Q${quarter}-${Date.now()}`,
      status: 'submitted',
      submittedAt: new Date().toISOString(),
      period: `${quarter} ${year}`,
      vatData: vatData,
      confirmation: {
        message: 'VAT return submitted successfully to HMRC',
        reference: `HMRC-${Date.now()}`,
        dueDate: getNextQuarterDueDate(quarter, year)
      }
    };
    
    res.json(submission);
  } catch (error) {
    console.error('VAT submission error:', error);
    res.status(500).json({ error: 'Failed to submit VAT return' });
  }
});

module.exports = router; 