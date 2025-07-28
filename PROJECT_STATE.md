# UK Invoice App - Project State Documentation

## 📅 Last Updated: July 28, 2025

## 🎯 Current Project Status

### ✅ **Fully Functional Full-Stack Application**
- **Frontend**: Single-page HTML app with responsive design
- **Backend**: Node.js/Express API with PostgreSQL database
- **Database**: Prisma ORM with complete schema
- **Authentication**: JWT-based auth with email verification

## 🏗️ **Architecture Overview**

### **Frontend (UKInvoiceApp/index.html)**
- **Location**: `/Users/admin/invoice_mate/UKInvoiceApp/index.html`
- **Type**: Single HTML file with embedded CSS/JS
- **Features**:
  - Responsive mobile-first design
  - Complete invoice management system
  - Client management
  - Expense tracking
  - VAT reporting
  - Financial reports
  - Company setup with accounting dates
  - PDF generation and email functionality

### **Backend (Node.js/Express)**
- **Location**: `/Users/admin/invoice_mate/backend/`
- **Port**: 3000
- **Database**: PostgreSQL (Neon.tech)
- **ORM**: Prisma
- **Key Files**:
  - `server.js` - Main server file
  - `prisma/schema.prisma` - Database schema
  - `routes/` - API endpoints
  - `middleware/` - Authentication middleware

## 🚀 **How to Restart the Project**

### **1. Start Backend Server**
```bash
cd /Users/admin/invoice_mate/backend
npm install
node server.js
```
**Expected Output:**
```
🚀 UK Invoice App API running on port 3000
📊 Health check: http://localhost:3000/health
🔐 Auth endpoints: http://localhost:3000/api/auth
🏢 Company endpoints: http://localhost:3000/api/companies
👥 Client endpoints: http://localhost:3000/api/clients
📄 Invoice endpoints: http://localhost:3000/api/invoices
💰 Expense endpoints: http://localhost:3000/api/expenses
⚙️ Settings endpoints: http://localhost:3000/api/settings
```

### **2. Start Frontend Server**
```bash
cd /Users/admin/invoice_mate/UKInvoiceApp
python3 -m http.server 8080
```
**Expected Output:**
```
Serving HTTP on :: port 8080 (http://[::]:8080/) ...
```

### **3. Access the Application**
- **Frontend**: http://localhost:8080
- **Backend Health Check**: http://localhost:3000/health

## 🔐 **Authentication**

### **Test Users Available:**
1. **Email**: `ontario2801@gmail.com`
   - **Password**: `password123`
   - **Status**: Verified

2. **Email**: `demo@example.com`
   - **Password**: `password123`
   - **Status**: Verified

## 📊 **Database Schema**

### **Main Models:**
- **User**: Authentication and user management
- **Company**: Business information and VAT settings
- **Client**: Customer/client management
- **Invoice**: Invoice creation and management
- **LineItem**: Invoice line items
- **Expense**: Expense tracking
- **Setting**: Application settings

## 🎨 **Recent UI Updates**

### **Reports Screen**
- **Location**: Financial Reports section
- **Features**: Quarterly/Annual reports with 70% width buttons
- **Period Selection**: 85% width filter buttons (reduced by 15%)

### **Company Setup**
- **Accounting Dates**: Sole trader and company options
- **VAT Quarters**: Standard UK VAT schedules with custom options
- **Auto-calculation**: Next VAT return due dates

### **Mobile Responsiveness**
- **Button Widths**: 70% of mobile screen width
- **Filter Buttons**: 85% width (15% reduction)
- **Vertical Stacking**: Optimized for mobile devices

## 🔧 **Technical Notes**

### **PDF Generation**
- **Library**: html2pdf.js
- **Fallback**: html2canvas for direct image download
- **Print-to-PDF**: Browser print functionality

### **Email Integration**
- **Method**: mailto: links with Web Share API
- **Features**: Invoice PDF attachment support

### **Database Connection**
- **Provider**: Neon.tech PostgreSQL
- **Connection String**: Stored in backend/.env
- **Status**: Active and functional

## 🚨 **Known Issues**

### **Linter Warnings**
- CSS linter shows some warnings but doesn't affect functionality
- These are cosmetic and don't impact the application

### **Database Connection**
- Occasional PostgreSQL connection drops (handled gracefully)
- Prisma automatically reconnects

## 📝 **Development Workflow**

### **Making Changes**
1. **Frontend**: Edit `UKInvoiceApp/index.html`
2. **Backend**: Edit files in `backend/` directory
3. **Database**: Use Prisma migrations for schema changes

### **Testing**
1. **Backend**: `curl http://localhost:3000/health`
2. **Frontend**: Refresh browser at `http://localhost:8080`
3. **Database**: Check Prisma Studio or direct queries

## 🔄 **Version Control**

### **Git Repository**
- **Location**: `/Users/admin/invoice_mate/`
- **Status**: Initialized with complete project state
- **Commit**: "Complete project state - UK Invoice App with full stack setup"

### **Backup Strategy**
- **Git**: Version control for code changes
- **Database**: Neon.tech provides automatic backups
- **Environment**: .env files contain configuration

## 🎯 **Next Steps (When Returning)**

1. **Start Servers**: Follow the restart instructions above
2. **Test Login**: Use the provided test credentials
3. **Verify Features**: Check all screens and functionality
4. **Database**: Ensure Prisma connection is working
5. **Development**: Continue from the current state

## 📞 **Support Information**

### **Key Files to Check if Issues Arise:**
- `backend/server.js` - Main server configuration
- `backend/prisma/schema.prisma` - Database schema
- `UKInvoiceApp/index.html` - Frontend application
- `backend/.env` - Environment configuration

### **Common Commands:**
```bash
# Check server status
curl http://localhost:3000/health

# Check frontend
curl http://localhost:8080

# Database migrations
cd backend && npx prisma db push

# Generate Prisma client
cd backend && npx prisma generate
```

---

**This documentation should provide everything needed to successfully return to and continue development of the UK Invoice App project.** 