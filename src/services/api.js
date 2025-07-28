import axios from 'axios';
import * as Keychain from 'react-native-keychain';

const API_BASE_URL = 'https://your-api-domain.com/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(async (config) => {
  try {
    const credentials = await Keychain.getInternetCredentials('auth_token');
    if (credentials && credentials.password) {
      const token = JSON.parse(credentials.password);
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.log('No auth token found');
  }
  return config;
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Handle token refresh or logout
      try {
        await Keychain.resetInternetCredentials('auth_token');
      } catch (e) {
        console.log('Error clearing credentials:', e);
      }
    }
    return Promise.reject(error);
  }
);

export const api = {
  // Authentication
  signup: (userData) => apiClient.post('/auth/signup', userData),
  login: (credentials) => apiClient.post('/auth/login', credentials),
  logout: () => apiClient.post('/auth/logout'),
  forgotPassword: (email) => apiClient.post('/auth/forgot-password', { email }),
  resetPassword: (resetData) => apiClient.post('/auth/reset-password', resetData),
  changePassword: (passwordData) => apiClient.post('/auth/change-password', passwordData),
  getProfile: () => apiClient.get('/auth/profile'),
  updateProfile: (profileData) => apiClient.put('/auth/profile', profileData),
  refreshToken: (refreshToken) => apiClient.post('/auth/refresh', { refresh_token: refreshToken }),

  // Business Profile
  createBusinessProfile: (data) => apiClient.post('/business-profile', data),
  getBusinessProfile: () => apiClient.get('/business-profile'),
  updateBusinessProfile: (data) => apiClient.put('/business-profile', data),
  
  // CONSTRUCTION-SPECIFIC ENDPOINTS
  setupConstructionBusiness: (setupData) => 
    apiClient.post('/construction/business-setup', setupData),
  
  // Construction Clients
  createConstructionClient: (clientData) => 
    apiClient.post('/construction/clients', clientData),
  getConstructionClients: () => 
    apiClient.get('/construction/clients'),
  updateConstructionClient: (clientId, clientData) =>
    apiClient.put(`/construction/clients/${clientId}`, clientData),
  deleteConstructionClient: (clientId) =>
    apiClient.delete(`/construction/clients/${clientId}`),
  
  // CIS Endpoints
  verifySubcontractor: (verificationData) => 
    apiClient.post('/cis/verify-subcontractor', verificationData),
  getCISMonthlyReturns: (taxYear = null) => 
    apiClient.get('/cis/monthly-returns', { params: { tax_year: taxYear } }),
  generateCISMonthlyReturn: (taxMonth) => 
    apiClient.post(`/cis/generate-monthly-return/${taxMonth}`),
  submitCISReturn: (returnId) => 
    apiClient.post(`/cis/submit-return/${returnId}`),
  getCISCompliance: () => 
    apiClient.get('/cis/compliance-status'),

  // Making Tax Digital Endpoints
  checkMTDEligibility: () => 
    apiClient.get('/mtd/eligibility'),
  getMTDQuarterlyPeriods: (taxYear) => 
    apiClient.get(`/mtd/quarterly-periods/${taxYear}`),
  generateMTDQuarterlySubmission: (submissionData) => 
    apiClient.post('/mtd/generate-quarterly-submission', submissionData),
  submitMTDQuarterly: (submissionId) => 
    apiClient.post(`/mtd/submit-quarterly/${submissionId}`),
  getQuarterlyNIEstimates: (taxYear, quarter) => 
    apiClient.get(`/mtd/ni-estimates/${taxYear}/${quarter}`),
  getMTDComplianceStatus: () => 
    apiClient.get('/mtd/compliance-status'),
  getMTDTaxCalculation: (taxYear) => 
    apiClient.get(`/mtd/tax-calculation/${taxYear}`),

  // Construction Invoices
  createConstructionInvoice: (invoiceData) => 
    apiClient.post('/construction/invoices', invoiceData),
  getConstructionDashboard: (periodDays = 30) => 
    apiClient.get('/construction/dashboard', { params: { period_days: periodDays } }),

  // Invoice Management
  createInvoice: (data) => apiClient.post('/invoices', data),
  getInvoices: (params = {}) => apiClient.get('/invoices', { params }),
  getInvoice: (id) => apiClient.get(`/invoices/${id}`),
  updateInvoice: (id, data) => apiClient.put(`/invoices/${id}`, data),
  deleteInvoice: (id) => apiClient.delete(`/invoices/${id}`),
  downloadInvoicePDF: (id) => apiClient.get(`/invoices/${id}/pdf`, {
    responseType: 'blob'
  }),
  
  // Email functionality
  sendInvoiceEmail: (invoiceId, emailData) => 
    apiClient.post(`/invoices/${invoiceId}/send-email`, emailData),
  sendInvoiceToClient: (invoiceId, templateName = 'default', customMessage = null) => 
    apiClient.post(`/invoices/${invoiceId}/send-to-client`, null, {
      params: { template_name: templateName, custom_message: customMessage }
    }),
  sendBulkInvoices: (invoiceData) => 
    apiClient.post('/invoices/send-bulk', invoiceData),
  sendPaymentReminder: (invoiceId, reminderType) => 
    apiClient.post(`/invoices/${invoiceId}/send-reminder`, { reminder_type: reminderType }),
  getInvoiceEmailHistory: (invoiceId) => 
    apiClient.get(`/invoices/${invoiceId}/email-history`),
  
  // Email templates
  getEmailTemplates: () => apiClient.get('/email-templates'),
  createEmailTemplate: (templateData) => 
    apiClient.post('/email-templates', templateData),
  updateEmailTemplate: (templateId, templateData) => 
    apiClient.put(`/email-templates/${templateId}`, templateData),
  deleteEmailTemplate: (templateId) =>
    apiClient.delete(`/email-templates/${templateId}`),
  validateEmailTemplate: (templateContent) => 
    apiClient.post('/email-templates/validate', { template_content: templateContent }),

  // INVOICE MATE - Metrics & Analytics
  getDashboardMetrics: (periodDays = 30) => 
    apiClient.get('/dashboard', { params: { period_days: periodDays } }),
  
  getInvoiceHistory: (params) => 
    apiClient.get('/invoices/history', { params }),
  
  getClientAnalytics: (clientId = null) => 
    apiClient.get('/analytics/clients', { params: { client_id: clientId } }),
  
  getFinancialSummary: (year) => 
    apiClient.get('/reports/financial-summary', { params: { year } }),
  
  recordPayment: (invoiceId, paymentData) => 
    apiClient.post(`/invoices/${invoiceId}/payments`, paymentData),
  
  getInvoicePayments: (invoiceId) => 
    apiClient.get(`/invoices/${invoiceId}/payments`),
  
  getBusinessOverview: () => 
    apiClient.get('/stats/overview'),

  // Client management
  getClients: () => apiClient.get('/clients'),
  createClient: (clientData) => apiClient.post('/clients', clientData),
  updateClient: (clientId, clientData) => apiClient.put(`/clients/${clientId}`, clientData),
  deleteClient: (clientId) => apiClient.delete(`/clients/${clientId}`),
  getClient: (clientId) => apiClient.get(`/clients/${clientId}`),
};

export default api; 