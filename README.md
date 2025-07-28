# UK Invoice App - Mobile Integration & Compliance Guide

A comprehensive React Native application for UK invoice management with construction industry focus, featuring email integration, VAT calculations, and UK compliance features.

## 🚀 Features

### Core Features
- **UK-Specific Business Rules**: UTR, VAT number, and company number validation
- **VAT Calculation**: Automatic UK VAT rates (20%, 5%, 0%, exempt)
- **Email Integration**: Send invoices via email with templates
- **Bulk Operations**: Send multiple invoices at once
- **Payment Reminders**: Automated overdue invoice reminders
- **PDF Generation**: Professional invoice PDFs with UK formatting
- **Secure Storage**: Encrypted storage for sensitive business data

### Construction Industry Features
- **CIS Integration**: Construction Industry Scheme compliance
- **Making Tax Digital**: MTD-ready for future HMRC integration
- **Subcontractor Verification**: CIS subcontractor validation
- **Monthly Returns**: CIS monthly return generation

### Email Management
- **Email Templates**: Customizable email templates
- **Email History**: Track email delivery and engagement
- **Bulk Email**: Send multiple invoices efficiently
- **Payment Reminders**: Automated overdue invoice reminders

## 📱 Mobile App Architecture

### Project Structure
```
src/
├── components/
│   ├── BusinessSetup/
│   │   ├── TradingTypeSelector.js
│   │   ├── UTRInput.js
│   │   ├── VATRegistrationForm.js
│   │   └── CompanyDetailsForm.js
│   ├── InvoiceCreation/
│   │   ├── ClientSelector.js
│   │   ├── LineItemForm.js
│   │   ├── VATCalculator.js
│   │   └── InvoiceSummary.js
│   ├── EmailInvoice/
│   │   └── EmailInvoiceModal.js
│   ├── EmailHistory/
│   │   └── EmailHistoryScreen.js
│   └── BulkActions/
│       └── BulkEmailModal.js
├── screens/
│   └── InvoiceListScreen.js
├── services/
│   ├── api.js
│   ├── secureStorage.js
│   └── pdfService.js
└── utils/
    ├── ukValidation.js
    ├── vatCalculation.js
    └── dateHelpers.js
```

## 🛠 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- React Native CLI
- iOS Simulator or Android Emulator
- CocoaPods (for iOS)

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd UKInvoiceApp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install additional dependencies**
   ```bash
   npm install @react-navigation/native @react-navigation/stack
   npm install react-native-vector-icons react-native-document-picker
   npm install react-native-pdf react-native-share
   npm install @reduxjs/toolkit react-redux
   npm install axios react-native-keychain
   ```

4. **iOS Setup (macOS only)**
   ```bash
   cd ios
   pod install
   cd ..
   ```

5. **Run the application**
   ```bash
   # For iOS
   npx react-native run-ios
   
   # For Android
   npx react-native run-android
   ```

## 🔧 Configuration

### API Configuration
Update the API base URL in `src/services/api.js`:
```javascript
const API_BASE_URL = 'https://your-api-domain.com/api';
```

### Environment Variables
Create a `.env` file in the root directory:
```env
API_BASE_URL=https://your-api-domain.com/api
ENVIRONMENT=development
```

## 📋 UK Compliance Features

### Business Validation
- **UTR Validation**: 10-digit Unique Taxpayer Reference
- **VAT Number Validation**: GB-prefixed 9-digit format
- **Company Number Validation**: 8-character alphanumeric
- **Postcode Validation**: UK postcode format validation

### VAT Calculation
- **Standard Rate**: 20% VAT
- **Reduced Rate**: 5% VAT
- **Zero Rate**: 0% VAT
- **Exempt**: No VAT calculation

### Tax Year Handling
- **UK Tax Year**: 6 April to 5 April
- **Automatic Detection**: Current tax year calculation
- **Period Management**: Quarterly and monthly periods

## 📧 Email Integration

### Email Templates
The app supports customizable email templates:
- **Default Invoice**: Standard invoice email
- **Professional**: Formal business communication
- **Friendly Reminder**: Gentle payment reminders

### Email Features
- **Template Selection**: Choose from predefined templates
- **Custom Messages**: Add personal messages to emails
- **Bulk Sending**: Send multiple invoices at once
- **Email Tracking**: Monitor delivery and engagement
- **Payment Reminders**: Automated overdue invoice reminders

### Email History
- **Delivery Status**: Track sent, delivered, opened, bounced
- **Engagement Metrics**: Monitor email open rates
- **Bounce Handling**: Track and handle email bounces

## 🔐 Security Features

### Secure Storage
- **Keychain Integration**: iOS secure storage
- **Encrypted Data**: Sensitive business information
- **Token Management**: Secure authentication tokens

### Data Protection
- **GDPR Compliance**: Data export and deletion
- **Encryption**: Data in transit and at rest
- **Access Control**: Secure authentication

## 📊 Business Intelligence

### Dashboard Metrics
- **Invoice Analytics**: Revenue tracking and trends
- **Client Analytics**: Client payment behavior
- **Financial Summary**: Annual and quarterly reports
- **Compliance Status**: CIS and MTD compliance tracking

### Construction Industry Features
- **CIS Monthly Returns**: Automated CIS return generation
- **Subcontractor Management**: CIS subcontractor verification
- **MTD Integration**: Making Tax Digital compliance
- **Quarterly Estimates**: National Insurance estimates

## 🚀 Deployment

### App Store Requirements
- **Data Protection**: GDPR compliance implementation
- **Financial App Security**: Secure authentication and encryption
- **UK Tax Compliance**: HMRC digital standards compliance
- **Privacy Policy**: Clear data usage policies

### Performance Optimization
- **Database Indexing**: Optimized database queries
- **Mobile Optimization**: Lazy loading and efficient rendering
- **Error Handling**: Comprehensive error boundaries
- **Loading States**: Better user experience

## 📱 Usage Guide

### Creating Invoices
1. **Business Setup**: Configure your business details
2. **Client Management**: Add and manage clients
3. **Invoice Creation**: Create invoices with line items
4. **VAT Calculation**: Automatic VAT calculation
5. **Email Sending**: Send invoices via email

### Email Management
1. **Template Selection**: Choose email template
2. **Custom Message**: Add personal message
3. **Bulk Operations**: Select multiple invoices
4. **Payment Reminders**: Send overdue reminders

### Compliance Features
1. **CIS Returns**: Generate monthly CIS returns
2. **MTD Integration**: Prepare for Making Tax Digital
3. **Tax Calculations**: Automatic tax year handling
4. **Validation**: UK business rule validation

## 🔧 Development

### Code Structure
- **Components**: Reusable UI components
- **Services**: API and business logic
- **Utils**: Helper functions and calculations
- **Screens**: Main application screens

### Testing
```bash
# Run tests
npm test

# Run specific test file
npm test -- --testPathPattern=ukValidation
```

### Building for Production
```bash
# iOS
npx react-native run-ios --configuration Release

# Android
npx react-native run-android --variant=release
```

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

Please read CONTRIBUTING.md for details on our code of conduct and the process for submitting pull requests.

## 📞 Support

For support and questions:
- Email: support@invoice-mate.com
- Documentation: https://docs.invoice-mate.com
- Issues: GitHub Issues

---

**Built with ❤️ for the UK construction industry** 