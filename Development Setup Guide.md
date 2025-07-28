Development Setup Guide - Invoice Mate
🚀 Quick Start
This guide will help you set up Invoice Mate for development in Cursor AI and other environments.
📋 Prerequisites
Required Software

Python 3.11+ - Backend API development
Node.js 18+ - Mobile app development
PostgreSQL 15+ - Database
Redis 7+ - Caching and sessions
Git - Version control

Development Tools

Cursor AI - Primary IDE (recommended)
Docker & Docker Compose - Containerized development
Postman/Insomnia - API testing
React Native CLI - Mobile development
Android Studio/Xcode - Mobile emulators

🏗️ Project Structure
invoice-mate/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── main.py         # FastAPI application entry
│   │   ├── models/         # Database models
│   │   ├── services/       # Business logic
│   │   ├── routers/        # API endpoints
│   │   ├── utils/          # Utility functions
│   │   └── tests/          # Backend tests
│   ├── requirements.txt    # Python dependencies
│   ├── Dockerfile         # Backend container
│   └── alembic/           # Database migrations
├── mobile/                 # React Native app
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── screens/       # Screen components
│   │   ├── services/      # API and business logic
│   │   ├── utils/         # Utility functions
│   │   └── store/         # Redux state management
│   ├── package.json       # Node dependencies
│   └── android/ios/       # Platform-specific code
├── docs/                  # Documentation
├── scripts/               # Development scripts
├── docker-compose.yml     # Development environment
└── README.md              # Project overview
🐳 Docker Development Setup (Recommended)
1. Clone Repository
bashgit clone https://github.com/your-org/invoice-mate.git
cd invoice-mate
2. Environment Configuration
Create .env file in project root:
bash# Database
DATABASE_URL=postgresql://invoice_mate:dev_password@localhost:5432/invoice_mate_dev
POSTGRES_DB=invoice_mate_dev
POSTGRES_USER=invoice_mate
POSTGRES_PASSWORD=dev_password

# Redis
REDIS_URL=redis://localhost:6379/0

# JWT & Security
JWT_SECRET_KEY=your-super-secret-jwt-key-change-in-production
REFRESH_TOKEN_SECRET=your-refresh-token-secret-key
ENCRYPTION_KEY=your-fernet-encryption-key

# HMRC APIs (Sandbox)
HMRC_API_BASE_URL=https://test-api.service.hmrc.gov.uk
HMRC_CLIENT_ID=your-hmrc-client-id
HMRC_CLIENT_SECRET=your-hmrc-client-secret

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# AWS S3 (for PDF storage)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_S3_BUCKET=invoice-mate-dev-docs
AWS_REGION=eu-west-2

# Development
DEBUG=True
ENVIRONMENT=development
LOG_LEVEL=DEBUG
3. Start Development Environment
bash# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
4. Run Database Migrations
bash# Access backend container
docker-compose exec api bash

# Run migrations
alembic upgrade head

# Create test data (optional)
python scripts/create_test_data.py
🐍 Backend Development Setup
1. Python Virtual Environment
bashcd backend

# Create virtual environment
python -m venv venv

# Activate (Linux/Mac)
source venv/bin/activate

# Activate (Windows)
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
2. Database Setup
bash# Install PostgreSQL (Ubuntu/Debian)
sudo apt update
sudo apt install postgresql postgresql-contrib

# Create database and user
sudo -u postgres psql
CREATE DATABASE invoice_mate_dev;
CREATE USER invoice_mate WITH PASSWORD 'dev_password';
GRANT ALL PRIVILEGES ON DATABASE invoice_mate_dev TO invoice_mate;
\q

# Run migrations
alembic upgrade head
3. Start Backend Server
bash# Development server with hot reload
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Or using Python directly
python -m app.main

# API will be available at: http://localhost:8000
# Interactive docs: http://localhost:8000/docs
4. Backend Testing
bash# Run all tests
pytest

# Run with coverage
pytest --cov=app --cov-report=html

# Run specific test file
pytest tests/test_cis_service.py

# Run tests in watch mode
pytest-watch
📱 Mobile Development Setup
1. React Native Environment
bash# Install React Native CLI
npm install -g react-native-cli

# Install dependencies
cd mobile
npm install

# Install iOS dependencies (Mac only)
cd ios && pod install && cd ..
2. Environment Configuration
Create mobile/.env:
bashAPI_BASE_URL=http://localhost:8000/api
ENVIRONMENT=development
DEBUG=true
3. Start Metro Bundler
bash# Start Metro
npx react-native start

# Or with reset cache
npx react-native start --reset-cache
4. Run on Devices/Emulators
bash# Android
npx react-native run-android

# iOS (Mac only)
npx react-native run-ios

# Specific iOS simulator
npx react-native run-ios --simulator="iPhone 15 Pro"
🔧 Development Tools & Scripts
Backend Scripts
bash# Generate new migration
cd backend
alembic revision --autogenerate -m "Add new table"

# Reset database
python scripts/reset_database.py

# Create test data
python scripts/create_test_data.py

# Run CIS compliance tests
python scripts/test_cis_integration.py

# Check code formatting
black app/
isort app/
flake8 app/
Mobile Scripts
bash# Generate app icons
cd mobile
npm run generate-icons

# Build for testing
npm run build:dev

# Run E2E tests
npm run test:e2e

# Clean build
npm run clean

# Check TypeScript
npm run type-check
🧪 Testing & Quality Assurance
Backend Testing Strategy
python# tests/test_cis_service.py
import pytest
from app.services.cis_service import CISService
from app.models import User, BusinessProfile, ConstructionClient

@pytest.fixture
def test_contractor():
    return BusinessProfile(
        trading_type="sole_trader",
        business_name="Test Construction Ltd",
        is_cis_contractor=True,
        utr_number="1234567890"
    )

@pytest.fixture
def test_subcontractor():
    return ConstructionClient(
        name="Test Electrical Services",
        is_subcontractor=True,
        utr_number="0987654321",
        cis_status="registered"
    )

def test_cis_deduction_calculation(test_contractor, test_subcontractor):
    """Test CIS deduction calculation for registered subcontractor"""
    cis_service = CISService(mock_db)
    
    result = cis_service.calculate_cis_deduction(
        labour_amount_pence=100000,    # £1000
        materials_amount_pence=30000,  # £300
        subcontractor_status="registered"
    )
    
    assert result["deduction_rate"] == 20.0
    assert result["cis_deduction_pence"] == 20000  # 20% of labour only
    assert result["net_payment_pence"] == 110000   # Total - CIS deduction

def test_monthly_cis_return_generation():
    """Test monthly CIS return generation"""
    # Test implementation
    pass
Mobile Testing Setup
javascript// mobile/__tests__/CISCalculation.test.js
import { calculateCISDeduction } from '../src/utils/calculations';

describe('CIS Calculations', () => {
  test('should calculate 20% deduction for registered subcontractor', () => {
    const result = calculateCISDeduction({
      labourAmount: 1000.00,
      materialsAmount: 300.00,
      subcontractorStatus: 'registered'
    });

    expect(result.deductionRate).toBe(20.0);
    expect(result.cisDeduction).toBe(200.00);
    expect(result.netPayment).toBe(1100.00);
  });

  test('should calculate 30% deduction for unregistered subcontractor', () => {
    const result = calculateCISDeduction({
      labourAmount: 1000.00,
      materialsAmount: 300.00,
      subcontractorStatus: 'unregistered'
    });

    expect(result.deductionRate).toBe(30.0);
    expect(result.cisDeduction).toBe(300.00);
    expect(result.netPayment).toBe(1000.00);
  });
});
🔍 Debugging & Monitoring
Backend Debugging
python# app/utils/logging.py
import structlog
import sys

# Configure structured logging
structlog.configure(
    processors=[
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.add_log_level,
        structlog.processors.JSONRenderer()
    ],
    wrapper_class=structlog.make_filtering_bound_logger(20),  # INFO level
    logger_factory=structlog.PrintLoggerFactory(file=sys.stdout),
    cache_logger_on_first_use=True,
)

logger = structlog.get_logger()

# Usage in services
def verify_subcontractor(self, contractor_utr: str, subcontractor_data: dict):
    logger.info(
        "cis_verification_started",
        contractor_utr=contractor_utr,
        subcontractor_name=subcontractor_data.get("name")
    )
    
    try:
        # Verification logic
        result = self._call_hmrc_api(...)
        
        logger.info(
            "cis_verification_successful",
            contractor_utr=contractor_utr,
            deduction_rate=result.get("deduction_rate")
        )
        
        return result
        
    except Exception as e:
        logger.error(
            "cis_verification_failed",
            contractor_utr=contractor_utr,
            error=str(e)
        )
        raise
Mobile Debugging
javascript// mobile/src/utils/logger.js
import { logger } from 'flipper-logger';

export const log = {
  debug: (message, data = {}) => {
    if (__DEV__) {
      console.log(`[DEBUG] ${message}`, data);
      logger.debug(message, data);
    }
  },
  
  info: (message, data = {}) => {
    console.info(`[INFO] ${message}`, data);
    logger.info(message, data);
  },
  
  error: (message, error = {}) => {
    console.error(`[ERROR] ${message}`, error);
    logger.error(message, { error: error.message, stack: error.stack });
  }
};

// Usage in components
import { log } from '../utils/logger';

const CISVerificationScreen = () => {
  const verifySubcontractor = async (clientId) => {
    try {
      log.info('Starting CIS verification', { clientId });
      
      const result = await api.verifySubcontractor({ client_id: clientId });
      
      log.info('CIS verification successful', { 
        clientId, 
        deductionRate: result.deduction_rate 
      });
      
    } catch (error) {
      log.error('CIS verification failed', error);
    }
  };
};
🔒 Security & Environment Setup
HMRC API Credentials Setup

Register with HMRC Developer Hub

Visit: https://developer.service.hmrc.gov.uk/
Create developer account
Register application for CIS and MTD APIs


Sandbox vs Production
bash# Sandbox (Development)
HMRC_API_BASE_URL=https://test-api.service.hmrc.gov.uk

# Production
HMRC_API_BASE_URL=https://api.service.hmrc.gov.uk

OAuth 2.0 Flow Implementation
python# app/services/hmrc_auth.py
class HMRCAuthService:
    def __init__(self):
        self.client_id = settings.HMRC_CLIENT_ID
        self.client_secret = settings.HMRC_CLIENT_SECRET
        self.redirect_uri = settings.HMRC_REDIRECT_URI
    
    async def get_authorization_url(self, state: str) -> str:
        """Generate HMRC authorization URL"""
        params = {
            "response_type": "code",
            "client_id": self.client_id,
            "scope": "read:cis write:cis read:mtd-itsa write:mtd-itsa",
            "state": state,
            "redirect_uri": self.redirect_uri
        }
        
        return f"https://test-api.service.hmrc.gov.uk/oauth/authorize?{urlencode(params)}"


Database Security
sql-- Create read-only user for reporting
CREATE USER invoice_mate_readonly WITH PASSWORD 'readonly_password';
GRANT CONNECT ON DATABASE invoice_mate_dev TO invoice_mate_readonly;
GRANT USAGE ON SCHEMA public TO invoice_mate_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO invoice_mate_readonly;

-- Enable SSL (production)
ALTER SYSTEM SET ssl = on;
ALTER SYSTEM SET ssl_cert_file = '/path/to/server.crt';
ALTER SYSTEM SET ssl_key_file = '/path/to/server.key';
📊 Performance Monitoring
Database Performance
sql-- Monitor slow queries
SELECT query, mean_time, calls, total_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;

-- Index usage analysis
SELECT schemaname, tablename, attname, n_distinct, correlation
FROM pg_stats
WHERE tablename IN ('invoices', 'cis_deductions', 'mtd_quarterly_submissions');
API Performance Monitoring
python# app/middleware/performance.py
import time
from fastapi import Request
from app.utils.logging import logger

async def performance_middleware(request: Request, call_next):
    start_time = time.time()
    
    response = await call_next(request)
    
    process_time = time.time() - start_time
    
    logger.info(
        "api_request_completed",
        method=request.method,
        url=str(request.url),
        status_code=response.status_code,
        process_time=process_time
    )
    
    response.headers["X-Process-Time"] = str(process_time)
    return response
🚀 Deployment Preparation
Production Environment Variables
bash# Production .env
DATABASE_URL=postgresql://user:password@prod-db:5432/invoice_mate
REDIS_URL=redis://prod-redis:6379/0
JWT_SECRET_KEY=super-secure-production-key
HMRC_API_BASE_URL=https://api.service.hmrc.gov.uk
ENVIRONMENT=production
DEBUG=False
LOG_LEVEL=INFO
Docker Production Build
dockerfile# Dockerfile.prod
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

# Create non-root user
RUN useradd --create-home --shell /bin/bash invoice_mate
USER invoice_mate

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

CMD ["gunicorn", "app.main:app", "-w", "4", "-k", "uvicorn.workers.UvicornWorker", "--bind", "0.0.0.0:8000"]