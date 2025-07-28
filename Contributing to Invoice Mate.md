Contributing to Invoice Mate
🏗️ Welcome Contributors!
Thank you for your interest in contributing to Invoice Mate - the UK construction industry's most comprehensive invoicing and compliance platform. This guide will help you understand our development process, coding standards, and contribution workflow.
📋 Table of Contents

Getting Started
Development Standards
Code Quality Guidelines
Testing Requirements
Git Workflow
Pull Request Process
Documentation Standards
Security Guidelines

🚀 Getting Started
Prerequisites
Before contributing, ensure you have:

Python 3.11+ for backend development
Node.js 18+ for mobile app development
PostgreSQL 15+ and Redis 7+ for local development
Docker & Docker Compose for containerized development
Understanding of UK construction industry and CIS/MTD requirements

Initial Setup

Fork the repository on GitHub
Clone your fork locally
Set up development environment following DEVELOPMENT_SETUP.md
Run the test suite to ensure everything works
Create a feature branch for your contribution

bash# Clone your fork
git clone https://github.com/YOUR_USERNAME/invoice-mate.git
cd invoice-mate

# Set up upstream remote
git remote add upstream https://github.com/invoice-mate/invoice-mate.git

# Start development environment
docker-compose up -d

# Run tests
cd backend && pytest
cd ../mobile && npm test
🏗️ Development Standards
Code Organization
Our codebase follows domain-driven design with clear separation of concerns:
backend/
├── app/
│   ├── models/          # Database models (SQLAlchemy)
│   ├── services/        # Business logic layer
│   ├── routers/         # API endpoints (FastAPI)
│   ├── utils/           # Utility functions
│   ├── schemas/         # Pydantic schemas
│   └── tests/           # Test files
├── migrations/          # Database migrations (Alembic)
└── requirements.txt     # Python dependencies

mobile/
├── src/
│   ├── components/      # Reusable UI components
│   ├── screens/         # Screen-level components
│   ├── services/        # API and business logic
│   ├── utils/           # Utility functions
│   ├── store/           # Redux state management
│   └── __tests__/       # Test files
└── package.json         # Node.js dependencies
Naming Conventions
Backend (Python)
python# Files and modules: snake_case
cis_service.py
mtd_calculator.py

# Classes: PascalCase
class CISService:
class MTDQuarterlySubmission:

# Functions and variables: snake_case
def calculate_cis_deduction():
def verify_subcontractor():
user_id = 123
tax_year = "2024-25"

# Constants: UPPER_SNAKE_CASE
CIS_REGISTERED_RATE = 20.0
MTD_STANDARD_THRESHOLD = 50000
Mobile (JavaScript/React Native)
javascript// Files and components: PascalCase
CISComplianceScreen.js
InvoiceCreationForm.js

// Functions and variables: camelCase
const calculateCISDeduction = () => {};
const verifySubcontractor = async () => {};
const userId = 123;
const taxYear = "2024-25";

// Constants: UPPER_SNAKE_CASE
const CIS_REGISTERED_RATE = 20.0;
const MTD_QUARTERLY_DEADLINE_DAYS = 5;
Architecture Principles
1. Construction Industry Focus
Every feature must address real construction business needs:

CIS compliance is non-negotiable
Mobile-first for on-site usage
UK tax regulations are built-in
Professional appearance for client communications

2. Separation of Concerns
python# ✅ Good: Clear separation
class CISService:
    """Handles CIS business logic only"""
    def calculate_deduction(self, labour_amount, rate):
        return labour_amount * (rate / 100)

class CISAPIClient:
    """Handles HMRC API communication only"""
    async def verify_subcontractor(self, utr):
        return await self._call_hmrc_api(utr)

# ❌ Bad: Mixed concerns
class CISService:
    def calculate_and_submit_deduction(self, labour_amount, rate, utr):
        # Don't mix calculation logic with API calls
        deduction = labour_amount * (rate / 100)
        return self._submit_to_hmrc(deduction, utr)
3. Error Handling Strategy
python# ✅ Good: Specific error handling
class CISError(Exception):
    """Base exception for CIS operations"""
    pass

class SubcontractorNotFoundError(CISError):
    """Raised when subcontractor cannot be verified"""
    pass

class InvalidUTRError(CISError):
    """Raised when UTR format is invalid"""
    pass

def verify_subcontractor(utr: str) -> dict:
    try:
        if not validate_utr_format(utr):
            raise InvalidUTRError(f"Invalid UTR format: {utr}")
        
        result = hmrc_client.verify(utr)
        if not result.found:
            raise SubcontractorNotFoundError(f"UTR not found: {utr}")
        
        return result.data
    except HMRCAPIError as e:
        logger.error("HMRC API error during verification", utr=utr, error=str(e))
        raise CISError("Verification service temporarily unavailable")
🧪 Testing Requirements
Test Coverage Standards

Backend: Minimum 90% code coverage
Mobile: Minimum 80% code coverage
Critical paths: 100% coverage (CIS calculations, MTD submissions)
Integration tests: All HMRC API interactions

Backend Testing Guidelines
Unit Tests
python# tests/test_cis_service.py
import pytest
from decimal import Decimal
from app.services.cis_service import CISService
from app.models import ConstructionClient

class TestCISService:
    def setup_method(self):
        self.cis_service = CISService()
    
    def test_calculate_deduction_registered_subcontractor(self):
        """Test CIS deduction for registered subcontractor"""
        # Arrange
        labour_amount = Decimal('1000.00')
        materials_amount = Decimal('200.00')
        subcontractor_status = 'registered'
        
        # Act
        result = self.cis_service.calculate_cis_deduction(
            labour_amount=labour_amount,
            materials_amount=materials_amount,
            subcontractor_status=subcontractor_status
        )
        
        # Assert
        assert result['deduction_rate'] == Decimal('20.0')
        assert result['cis_deduction'] == Decimal('200.00')  # 20% of labour only
        assert result['net_payment'] == Decimal('1000.00')   # Total minus CIS
        assert result['materials_not_subject_to_cis'] == materials_amount
    
    @pytest.mark.parametrize("status,expected_rate", [
        ('registered', Decimal('20.0')),
        ('unregistered', Decimal('30.0')),
        ('gross_payment', Decimal('0.0')),
    ])
    def test_deduction_rates_by_status(self, status, expected_rate):
        """Test correct deduction rates for different statuses"""
        result = self.cis_service.get_deduction_rate(status)
        assert result == expected_rate
    
    def test_monthly_return_generation(self):
        """Test monthly CIS return generation"""
        # Test with mock data
        tax_month = '2024-04'
        
        with patch.object(self.cis_service, 'get_deductions_for_month') as mock_deductions:
            mock_deductions.return_value = [
                # Mock deduction data
            ]
            
            result = self.cis_service.generate_monthly_return(
                user_id=123,
                tax_month=tax_month
            )
            
            assert result['tax_month'] == tax_month
            assert 'total_payments' in result
            assert 'total_deductions' in result
Integration Tests
python# tests/integration/test_hmrc_integration.py
import pytest
from app.services.hmrc_api_service import HMRCAPIService

@pytest.mark.integration
class TestHMRCIntegration:
    def setup_method(self):
        # Use sandbox environment for testing
        self.hmrc_client = HMRCAPIService(environment='sandbox')
    
    async def test_cis_verification_flow(self):
        """Test complete CIS verification flow with HMRC sandbox"""
        # Use HMRC test data
        test_utr = "1234567890"  # HMRC sandbox test UTR
        
        result = await self.hmrc_client.verify_subcontractor(
            contractor_utr="0987654321",
            subcontractor_utr=test_utr,
            subcontractor_name="Test Subcontractor Ltd"
        )
        
        assert result['success'] is True
        assert 'verification_status' in result
        assert 'deduction_rate' in result
        assert result['deduction_rate'] in [0.0, 20.0, 30.0]
Mobile Testing Guidelines
Component Tests
javascript// mobile/src/components/__tests__/CISCalculation.test.js
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { store } from '../../store';
import CISCalculationComponent from '../CISCalculationComponent';

describe('CISCalculationComponent', () => {
  const renderWithRedux = (component) => {
    return render(
      <Provider store={store}>
        {component}
      </Provider>
    );
  };

  test('should calculate CIS deduction correctly for registered subcontractor', async () => {
    const { getByTestId, getByText } = renderWithRedux(
      <CISCalculationComponent 
        labourAmount={1000}
        materialsAmount={200}
        subcontractorStatus="registered"
      />
    );

    await waitFor(() => {
      expect(getByText('20%')).toBeTruthy(); // Deduction rate
      expect(getByText('£200.00')).toBeTruthy(); // CIS deduction
      expect(getByText('£1,000.00')).toBeTruthy(); // Net payment
    });
  });

  test('should handle unregistered subcontractor with 30% rate', async () => {
    const { getByText } = renderWithRedux(
      <CISCalculationComponent 
        labourAmount={1000}
        materialsAmount={200}
        subcontractorStatus="unregistered"
      />
    );

    await waitFor(() => {
      expect(getByText('30%')).toBeTruthy();
      expect(getByText('£300.00')).toBeTruthy();
      expect(getByText('£900.00')).toBeTruthy();
    });
  });
});
End-to-End Tests
javascript// mobile/e2e/invoiceCreation.e2e.js
import { device, element, by, expect } from 'detox';

describe('Invoice Creation Flow', () => {
  beforeEach(async () => {
    await device.reloadReactNative();
    await element(by.id('loginButton')).tap();
    // Login with test credentials
  });

  test('should create CIS invoice for subcontractor', async () => {
    // Navigate to invoice creation
    await element(by.id('createInvoiceButton')).tap();
    
    // Select CIS subcontractor
    await element(by.id('clientPicker')).tap();
    await element(by.text('Test Electrical Services (CIS Subcontractor)')).tap();
    
    // Add labour line item
    await element(by.id('addLineItemButton')).tap();
    await element(by.id('descriptionInput')).typeText('Electrical installation work');
    await element(by.id('quantityInput')).typeText('8');
    await element(by.id('unitPriceInput')).typeText('45.00');
    await element(by.id('labourToggle')).tap(); // Mark as labour
    
    // Verify CIS calculation
    await expect(element(by.id('cisDeductionAmount'))).toHaveText('£72.00');
    await expect(element(by.id('netPaymentAmount'))).toHaveText('£288.00');
    
    // Create invoice
    await element(by.id('createInvoiceButton')).tap();
    
    // Verify success
    await expect(element(by.text('Invoice created successfully'))).toBeVisible();
  });
});
🔄 Git Workflow
Branch Naming Convention
bash# Feature branches
feature/cis-verification-api
feature/mtd-quarterly-submission
feature/mobile-invoice-creation

# Bug fix branches
bugfix/cis-calculation-rounding
bugfix/invoice-pdf-generation

# Hotfix branches (for production issues)
hotfix/hmrc-api-timeout

# Release branches
release/v2.1.0
Commit Message Format
bash# Format: <type>(<scope>): <subject>
# 
# <type>: feat, fix, docs, style, refactor, test, chore
# <scope>: cis, mtd, invoices, mobile, api, db
# <subject>: concise description in present tense

# Examples:
feat(cis): add HMRC subcontractor verification API
fix(mtd): correct quarterly period calculation for calendar years
docs(api): update CIS endpoint documentation
test(invoices): add integration tests for PDF generation
refactor(mobile): simplify CIS calculation component
Commit Message Examples
bash# ✅ Good commit messages
feat(cis): implement monthly return generation with HMRC submission
fix(invoices): resolve CIS deduction rounding to comply with HMRC rules
docs(mtd): add MTD quarterly submission examples to API docs
test(cis): add comprehensive tests for all CIS deduction scenarios
refactor(mobile): extract CIS calculation logic to separate service

# ❌ Bad commit messages
fix: bug fix
update: changes
feat: new feature
wip: work in progress
📝 Pull Request Process
Before Submitting PR

Ensure all tests pass
bash# Backend tests
cd backend && pytest --cov=app --cov-report=html

# Mobile tests
cd mobile && npm test -- --coverage

# E2E tests
cd mobile && npm run test:e2e

Code quality checks
bash# Backend code quality
cd backend
black app/                    # Code formatting
isort app/                    # Import sorting
flake8 app/                   # Linting
mypy app/                     # Type checking

# Mobile code quality
cd mobile
npm run lint                  # ESLint
npm run type-check           # TypeScript checking
npm run format               # Prettier formatting

Update documentation if needed
Add/update tests for new functionality
Ensure CHANGELOG.md is updated for user-facing changes

PR Template
markdown## Description
Brief description of changes and motivation.

## Type of Change
- [ ] Bug fix (non-breaking change that fixes an issue)
- [ ] New feature (non-breaking change that adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Construction Industry Impact
- [ ] Affects CIS compliance calculations
- [ ] Impacts MTD reporting functionality
- [ ] Changes UK tax year handling
- [ ] Modifies HMRC API integration

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed
- [ ] E2E tests pass

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] No new security vulnerabilities introduced
- [ ] Breaking changes documented
Code Review Guidelines
For Authors

Small, focused PRs (under 400 lines when possible)
Clear description of what and why
Self-review before submitting
Responsive to feedback and quick iterations

For Reviewers

Focus on business logic correctness, especially CIS/MTD rules
Check error handling and edge cases
Verify test coverage for new functionality
Consider security implications
Be constructive and educational in feedback

📚 Documentation Standards
Code Documentation
Backend (Python)
pythonclass CISService:
    """Service for Construction Industry Scheme compliance operations.
    
    This service handles all CIS-related business logic including:
    - Subcontractor verification with HMRC
    - CIS deduction calculations according to UK tax rules
    - Monthly return generation and submission
    
    Attributes:
        hmrc_client: Client for HMRC API interactions
        db: Database session for data persistence
    """
    
    def calculate_cis_deduction(
        self, 
        labour_amount: Decimal, 
        materials_amount: Decimal,
        subcontractor_status: str
    ) -> dict:
        """Calculate CIS deduction based on UK tax rules.
        
        Args:
            labour_amount: Amount for labour work (subject to CIS)
            materials_amount: Amount for materials (not subject to CIS)
            subcontractor_status: One of 'registered', 'unregistered', 'gross_payment'
            
        Returns:
            Dict containing:
                - deduction_rate: Percentage rate applied
                - cis_deduction: Amount deducted in pence
                - net_payment: Amount to pay after deduction
                
        Raises:
            InvalidSubcontractorStatusError: If status is not recognized
            
        Example:
            >>> service = CISService()
            >>> result = service.calculate_cis_deduction(
            ...     labour_amount=Decimal('1000.00'),
            ...     materials_amount=Decimal('200.00'),
            ...     subcontractor_status='registered'
            ... )
            >>> result['cis_deduction']
            Decimal('200.00')  # 20% of labour only
        """
Mobile (JavaScript)
javascript/**
 * CIS Calculation Service
 * 
 * Handles Construction Industry Scheme deduction calculations
 * according to UK tax regulations.
 * 
 * @module CISCalculationService
 */

/**
 * Calculate CIS deduction for a subcontractor payment
 * 
 * @param {Object} params - Calculation parameters
 * @param {number} params.labourAmount - Labour amount in pounds
 * @param {number} params.materialsAmount - Materials amount in pounds
 * @param {string} params.subcontractorStatus - 'registered'|'unregistered'|'gross_payment'
 * @returns {Object} Calculation result
 * @returns {number} returns.deductionRate - Deduction percentage
 * @returns {number} returns.cisDeduction - Amount to deduct
 * @returns {number} returns.netPayment - Amount to pay after deduction
 * 
 * @example
 * const result = calculateCISDeduction({
 *   labourAmount: 1000.00,
 *   materialsAmount: 200.00,
 *   subcontractorStatus: 'registered'
 * });
 * // result.cisDeduction === 200.00 (20% of labour only)
 */
export const calculateCISDeduction = ({ labourAmount, materialsAmount, subcontractorStatus }) => {
  // Implementation
};
API Documentation
All API endpoints must have comprehensive OpenAPI/Swagger documentation:
python@router.post("/cis/verify-subcontractor", 
             summary="Verify CIS Subcontractor",
             description="Verify subcontractor status with HMRC CIS API")
async def verify_subcontractor(
    verification_request: CISVerificationRequest,
    current_user: User = Depends(get_current_user)
) -> CISVerificationResponse:
    """
    Verify a subcontractor's CIS status with HMRC.
    
    This endpoint will:
    1. Validate the provided UTR number format
    2. Call HMRC CIS verification API
    3. Update client record with verification status
    4. Return deduction rate to apply
    5. Log verification for audit trail
    
    - **UTR Number**: Must be exactly 10 digits
    - **Company Number**: Optional, 8-character format for limited companies
    - **Verification**: Results cached for performance
    
    Returns verification status and applicable deduction rate.
    """
🔒 Security Guidelines
Data Protection

Never log sensitive data (UTRs, passwords, financial amounts)
Encrypt sensitive fields in database (UTR numbers, bank details)
Use parameterized queries to prevent SQL injection
Validate all inputs at API boundaries
Implement rate limiting on all endpoints

HMRC API Security
python# ✅ Good: Secure HMRC API integration
class HMRCAPIClient:
    def __init__(self):
        self.client_id = settings.HMRC_CLIENT_ID
        self.client_secret = settings.HMRC_CLIENT_SECRET
        self.base_url = settings.HMRC_API_BASE_URL
        
    async def make_authenticated_request(self, endpoint: str, data: dict):
        """Make authenticated request to HMRC API"""
        try:
            # Get OAuth token
            token = await self.get_oauth_token()
            
            headers = {
                'Authorization': f'Bearer {token}',
                'Content-Type': 'application/json',
                'Accept': 'application/vnd.hmrc.1.0+json'
            }
            
            # Log request (without sensitive data)
            logger.info("HMRC API request", endpoint=endpoint, data_keys=list(data.keys()))
            
            response = await self.http_client.post(
                f"{self.base_url}{endpoint}",
                json=data,
                headers=headers,
                timeout=30
            )
            
            # Log response status (without sensitive data)
            logger.info("HMRC API response", endpoint=endpoint, status_code=response.status_code)
            
            return response.json()
            
        except Exception as e:
            # Log error without exposing sensitive information
            logger.error("HMRC API error", endpoint=endpoint, error_type=type(e).__name__)
            raise
Input Validation
python# ✅ Good: Comprehensive input validation
from pydantic import BaseModel, validator
import re

class CISVerificationRequest(BaseModel):
    client_id: int
    utr_number: str
    company_number: Optional[str] = None
    
    @validator('utr_number')
    def validate_utr_format(cls, v):
        """Validate UTR number format"""
        if not re.match(r'^\d{10}$', v):
            raise ValueError('UTR number must be exactly 10 digits')
        
        if v.startswith('0000'):
            raise ValueError('Invalid UTR number format')
            
        return v
    
    @validator('company_number')
    def validate_company_number(cls, v):
        """Validate company number format"""
        if v and not re.match(r'^[A-Z0-9]{8}$', v):
            raise ValueError('Company number must be 8 characters')
        return v
🎯 Review Checklist
Code Quality Checklist

 Business logic correctness (especially CIS/MTD calculations)
 Error handling for all failure scenarios
 Input validation at API boundaries
 Logging without exposing sensitive data
 Performance considerations for mobile usage
 Security implications reviewed
 UK compliance requirements met

Testing Checklist

 Unit tests cover new functionality
 Integration tests for HMRC API interactions
 Edge cases and error scenarios tested
 Mobile responsiveness tested on different devices
 Offline functionality works as expected
 Performance tested under load

Documentation Checklist

 Code comments explain complex business rules
 API documentation updated in OpenAPI spec
 README updated for new features
 CHANGELOG updated for user-facing changes
 Migration guide provided for breaking changes


Thank you for contributing to Invoice Mate! Together, we're building the future of construction industry compliance in the UK. 🏗️