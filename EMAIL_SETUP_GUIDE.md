# 📧 Email Verification Setup Guide

## Current Status: Development Mode

**✅ Email verification is currently disabled for development**  
**✅ New users are automatically verified**  
**✅ Login works immediately after registration**

## 🔧 How to Enable Email Verification in Production

### 1. Set Environment Variables

Add these to your `.env` file:

```bash
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# App Configuration
NODE_ENV=production
FRONTEND_URL=https://your-domain.com
```

### 2. Gmail Setup (Recommended)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password:**
   - Go to Google Account Settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
3. **Use the app password** as `SMTP_PASS`

### 3. Alternative Email Providers

#### SendGrid
```bash
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
```

#### Mailgun
```bash
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=your-mailgun-username
SMTP_PASS=your-mailgun-password
```

### 4. Test Email Configuration

```bash
# Test email sending
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'
```

### 5. Email Verification Flow

1. **User registers** → Verification email sent
2. **User clicks link** → Email verified
3. **User can login** → Access granted

### 6. Development vs Production

| Mode | Email Verification | Auto-Verify | Login After Registration |
|------|-------------------|-------------|-------------------------|
| Development | ❌ Disabled | ✅ Yes | ✅ Immediate |
| Production | ✅ Enabled | ❌ No | ❌ After Email Verification |

## 🚀 Quick Test

Try registering a new user now - it should work immediately in development mode!

```bash
# Test registration
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'

# Test login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

## 📝 Current Working Credentials

- **Email:** `ontario2801@gmail.com`
- **Password:** `password123`
- **Status:** ✅ Verified and ready to login 