import RNHTMLtoPDF from 'react-native-html-to-pdf';
import Share from 'react-native-share';
import { api } from './api';
import { formatCurrency, formatUKDate } from '../utils/vatCalculation';
import { formatUKDate as formatDate } from '../utils/dateHelpers';

export const generateInvoiceHTML = (invoiceData) => {
  const {
    invoice_number,
    invoice_date,
    due_date,
    client,
    business,
    line_items,
    subtotal,
    vat,
    total,
    notes
  } = invoiceData;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Invoice ${invoice_number}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 20px;
          color: #333;
        }
        .header {
          border-bottom: 2px solid #007AFF;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .business-info {
          float: left;
          width: 50%;
        }
        .invoice-info {
          float: right;
          width: 40%;
          text-align: right;
        }
        .clear {
          clear: both;
        }
        .client-info {
          margin-bottom: 30px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
        }
        th, td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #ddd;
        }
        th {
          background-color: #f8f9fa;
          font-weight: bold;
        }
        .totals {
          float: right;
          width: 300px;
        }
        .total-row {
          padding: 8px 0;
        }
        .total-row.grand-total {
          font-weight: bold;
          font-size: 18px;
          border-top: 2px solid #007AFF;
          margin-top: 10px;
          padding-top: 10px;
        }
        .notes {
          margin-top: 30px;
          padding: 15px;
          background-color: #f8f9fa;
          border-left: 4px solid #007AFF;
        }
        .footer {
          margin-top: 50px;
          padding-top: 20px;
          border-top: 1px solid #ddd;
          font-size: 12px;
          color: #666;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="business-info">
          <h1>${business?.name || 'Your Business Name'}</h1>
          <p>${business?.address?.line1 || ''}</p>
          <p>${business?.address?.line2 || ''}</p>
          <p>${business?.address?.city || ''}, ${business?.address?.postcode || ''}</p>
          <p>Phone: ${business?.phone || ''}</p>
          <p>Email: ${business?.email || ''}</p>
          ${business?.vat_number ? `<p>VAT Number: ${business.vat_number}</p>` : ''}
          ${business?.company_number ? `<p>Company Number: ${business.company_number}</p>` : ''}
        </div>
        <div class="invoice-info">
          <h2>INVOICE</h2>
          <p><strong>Invoice Number:</strong> ${invoice_number}</p>
          <p><strong>Date:</strong> ${formatDate(invoice_date)}</p>
          <p><strong>Due Date:</strong> ${formatDate(due_date)}</p>
        </div>
        <div class="clear"></div>
      </div>

      <div class="client-info">
        <h3>Bill To:</h3>
        <p><strong>${client?.name || 'Client Name'}</strong></p>
        <p>${client?.address?.line1 || ''}</p>
        <p>${client?.address?.line2 || ''}</p>
        <p>${client?.address?.city || ''}, ${client?.address?.postcode || ''}</p>
        <p>Email: ${client?.email || ''}</p>
      </div>

      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th>Quantity</th>
            <th>Unit Price</th>
            <th>VAT Rate</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${line_items?.map(item => `
            <tr>
              <td>${item.description}</td>
              <td>${item.quantity}</td>
              <td>${formatCurrency(item.unit_price)}</td>
              <td>${item.vat_rate}%</td>
              <td>${formatCurrency(item.total)}</td>
            </tr>
          `).join('') || ''}
        </tbody>
      </table>

      <div class="totals">
        <div class="total-row">
          <span>Subtotal:</span>
          <span style="float: right;">${formatCurrency(subtotal)}</span>
        </div>
        ${vat > 0 ? `
          <div class="total-row">
            <span>VAT (20%):</span>
            <span style="float: right;">${formatCurrency(vat)}</span>
          </div>
        ` : ''}
        <div class="total-row grand-total">
          <span>Total:</span>
          <span style="float: right;">${formatCurrency(total)}</span>
        </div>
      </div>

      ${notes ? `
        <div class="notes">
          <h4>Notes:</h4>
          <p>${notes}</p>
        </div>
      ` : ''}

      <div class="footer">
        <p>Thank you for your business!</p>
        <p>Payment Terms: 30 days from invoice date</p>
        <p>Please include invoice number when making payment</p>
      </div>
    </body>
    </html>
  `;
};

export const generateInvoicePDF = async (invoiceData) => {
  try {
    const htmlContent = generateInvoiceHTML(invoiceData);
    
    const options = {
      html: htmlContent,
      fileName: `Invoice-${invoiceData.invoice_number}`,
      directory: 'Documents',
    };
    
    const file = await RNHTMLtoPDF.convert(options);
    return file.filePath;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF');
  }
};

export const shareInvoice = async (filePath, invoiceNumber) => {
  try {
    const shareOptions = {
      title: `Invoice ${invoiceNumber}`,
      url: `file://${filePath}`,
      type: 'application/pdf',
    };
    
    await Share.open(shareOptions);
  } catch (error) {
    console.error('Error sharing invoice:', error);
    throw new Error('Failed to share invoice');
  }
};

export const sendInvoiceEmail = async (invoiceId, emailData) => {
  try {
    const response = await api.sendInvoiceEmail(invoiceId, emailData);
    return response.data;
  } catch (error) {
    throw new Error(`Failed to send invoice: ${error.message}`);
  }
};

export const sendInvoiceToClient = async (invoiceId, templateName = 'default', customMessage = null) => {
  try {
    const response = await api.sendInvoiceToClient(invoiceId, templateName, customMessage);
    return response.data;
  } catch (error) {
    throw new Error(`Failed to send invoice to client: ${error.message}`);
  }
};

export const downloadInvoicePDF = async (invoiceId) => {
  try {
    const response = await api.downloadInvoicePDF(invoiceId);
    return response.data;
  } catch (error) {
    throw new Error(`Failed to download invoice PDF: ${error.message}`);
  }
}; 