export const formatUKDate = (date) => {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(new Date(date));
};

export const formatUKDateTime = (date) => {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date));
};

export const getCurrentTaxYear = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // getMonth() returns 0-11
  
  // UK tax year runs from 6 April to 5 April
  if (month >= 4) {
    return `${year}/${year + 1}`;
  } else {
    return `${year - 1}/${year}`;
  }
};

export const getTaxYearStart = (taxYear) => {
  const [startYear] = taxYear.split('/');
  return new Date(parseInt(startYear), 3, 6); // April 6th
};

export const getTaxYearEnd = (taxYear) => {
  const [, endYear] = taxYear.split('/');
  return new Date(parseInt(endYear), 3, 5); // April 5th
};

export const calculateDueDate = (invoiceDate, paymentTerms = 30) => {
  const date = new Date(invoiceDate);
  date.setDate(date.getDate() + paymentTerms);
  return date;
};

export const isOverdue = (dueDate) => {
  const today = new Date();
  const due = new Date(dueDate);
  return today > due;
};

export const getDaysOverdue = (dueDate) => {
  const today = new Date();
  const due = new Date(dueDate);
  const diffTime = today - due;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const getDaysUntilDue = (dueDate) => {
  const today = new Date();
  const due = new Date(dueDate);
  const diffTime = due - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}; 