export const VAT_RATES = {
  STANDARD: 20.00,
  REDUCED: 5.00,
  ZERO: 0.00,
  EXEMPT: 0.00
};

export const calculateLineVAT = (quantity, unitPrice, vatScheme) => {
  const lineTotal = quantity * unitPrice;
  const vatRate = VAT_RATES[vatScheme] || 0;
  const vatAmount = (lineTotal * vatRate) / 100;
  
  return {
    lineTotal: parseFloat(lineTotal.toFixed(2)),
    vatAmount: parseFloat(vatAmount.toFixed(2)),
    totalWithVAT: parseFloat((lineTotal + vatAmount).toFixed(2))
  };
};

export const calculateInvoiceTotals = (lineItems, isVATRegistered) => {
  let subtotal = 0;
  let totalVAT = 0;
  
  lineItems.forEach(item => {
    const calc = calculateLineVAT(item.quantity, item.unitPrice, item.vatScheme);
    subtotal += calc.lineTotal;
    if (isVATRegistered) {
      totalVAT += calc.vatAmount;
    }
  });
  
  return {
    subtotal: parseFloat(subtotal.toFixed(2)),
    vat: parseFloat(totalVAT.toFixed(2)),
    total: parseFloat((subtotal + totalVAT).toFixed(2))
  };
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 2
  }).format(amount);
};

export const calculateVATBreakdown = (lineItems, isVATRegistered) => {
  const breakdown = {
    standard: 0,
    reduced: 0,
    zero: 0,
    exempt: 0
  };
  
  lineItems.forEach(item => {
    const calc = calculateLineVAT(item.quantity, item.unitPrice, item.vatScheme);
    if (isVATRegistered) {
      switch (item.vatScheme) {
        case 'STANDARD':
          breakdown.standard += calc.vatAmount;
          break;
        case 'REDUCED':
          breakdown.reduced += calc.vatAmount;
          break;
        case 'ZERO':
          breakdown.zero += calc.vatAmount;
          break;
        case 'EXEMPT':
          breakdown.exempt += calc.vatAmount;
          break;
      }
    }
  });
  
  return breakdown;
}; 