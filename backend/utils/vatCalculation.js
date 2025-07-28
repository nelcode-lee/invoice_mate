// UK VAT Rates (as of 2024)
const VAT_RATES = {
  STANDARD: 20.00,
  REDUCED: 5.00,
  ZERO: 0.00,
  EXEMPT: 0.00
};

// HMRC Mileage Rates (2024/25)
const MILEAGE_RATES = {
  car: 0.45,      // First 10,000 miles
  van: 0.45,      // All miles
  motorcycle: 0.24, // All miles
  bike: 0.20      // All miles
};

const vatCalculation = {
  // Calculate VAT for a single line item
  calculateLineVAT: (quantity, unitPrice, vatType) => {
    const lineTotal = quantity * unitPrice;
    const vatRate = VAT_RATES[vatType] || 0;
    const vatAmount = (lineTotal * vatRate) / 100;
    
    return {
      lineTotal: parseFloat(lineTotal.toFixed(2)),
      vatAmount: parseFloat(vatAmount.toFixed(2)),
      totalWithVAT: parseFloat((lineTotal + vatAmount).toFixed(2))
    };
  },

  // Calculate invoice totals
  calculateInvoiceTotals: (lineItems, isVATRegistered = true) => {
    let subtotal = 0;
    let totalVAT = 0;
    let vatBreakdown = {
      STANDARD: 0,
      REDUCED: 0,
      ZERO: 0,
      EXEMPT: 0
    };

    lineItems.forEach(item => {
      const calc = vatCalculation.calculateLineVAT(
        item.quantity, 
        item.unitPrice, 
        item.vatType
      );
      
      subtotal += calc.lineTotal;
      
      if (isVATRegistered) {
        totalVAT += calc.vatAmount;
        vatBreakdown[item.vatType] += calc.vatAmount;
      }
    });

    return {
      subtotal: parseFloat(subtotal.toFixed(2)),
      vat: parseFloat(totalVAT.toFixed(2)),
      total: parseFloat((subtotal + totalVAT).toFixed(2)),
      vatBreakdown: {
        STANDARD: parseFloat(vatBreakdown.STANDARD.toFixed(2)),
        REDUCED: parseFloat(vatBreakdown.REDUCED.toFixed(2)),
        ZERO: parseFloat(vatBreakdown.ZERO.toFixed(2)),
        EXEMPT: parseFloat(vatBreakdown.EXEMPT.toFixed(2))
      }
    };
  },

  // Calculate mileage expense
  calculateMileageExpense: (miles, vehicleType) => {
    const rate = MILEAGE_RATES[vehicleType] || 0;
    return parseFloat((miles * rate).toFixed(2));
  },

  // Format currency for UK
  formatCurrency: (amount) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(amount);
  },

  // Get VAT breakdown for reporting
  getVATBreakdown: (invoices) => {
    const breakdown = {
      totalNet: 0,
      totalVAT: 0,
      totalGross: 0,
      byRate: {
        STANDARD: { net: 0, vat: 0 },
        REDUCED: { net: 0, vat: 0 },
        ZERO: { net: 0, vat: 0 },
        EXEMPT: { net: 0, vat: 0 }
      }
    };

    invoices.forEach(invoice => {
      invoice.lineItems.forEach(item => {
        const calc = vatCalculation.calculateLineVAT(
          item.quantity,
          item.unitPrice,
          item.vatType
        );

        breakdown.totalNet += calc.lineTotal;
        breakdown.totalVAT += calc.vatAmount;
        breakdown.byRate[item.vatType].net += calc.lineTotal;
        breakdown.byRate[item.vatType].vat += calc.vatAmount;
      });
    });

    breakdown.totalGross = breakdown.totalNet + breakdown.totalVAT;

    // Round all values to 2 decimal places
    Object.keys(breakdown.byRate).forEach(rate => {
      breakdown.byRate[rate].net = parseFloat(breakdown.byRate[rate].net.toFixed(2));
      breakdown.byRate[rate].vat = parseFloat(breakdown.byRate[rate].vat.toFixed(2));
    });

    breakdown.totalNet = parseFloat(breakdown.totalNet.toFixed(2));
    breakdown.totalVAT = parseFloat(breakdown.totalVAT.toFixed(2));
    breakdown.totalGross = parseFloat(breakdown.totalGross.toFixed(2));

    return breakdown;
  }
};

module.exports = { vatCalculation, VAT_RATES, MILEAGE_RATES }; 