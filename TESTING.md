# MaliLink Testing Documentation

## Overview
This document contains all information needed to test the MaliLink B2B Trade & Import Management Platform.

**Application URL**: https://malilink.vercel.app

---

## Test Accounts

### Supplier Account
- **Email**: supplier@malilink.test
- **Password**: TestPassword123!
- **Role**: Supplier
- **Business**: Hassan Electronics Wholesale
- **Location**: Kariakoo, Dar es Salaam
- **KYC Status**: Verified
- **Phone**: +255712345678

### Importer Account
- **Email**: importer@malilink.test
- **Password**: TestPassword123!
- **Role**: Importer
- **Business**: Mwangi Trading Company
- **Location**: Ilala, Dar es Salaam
- **KYC Status**: Verified
- **Phone**: +255787654321

### Admin Account
- **Email**: admin@malilink.test
- **Password**: TestPassword123!
- **Role**: Admin
- **Business**: MaliLink Admin
- **Location**: Dar es Salaam

---

## Sample Data Available

### Products (Created by Supplier)

#### 1. Samsung Galaxy A13
- **Price**: $150 USD / 375,000 TZS
- **Category**: Mobile Phones
- **Unit**: Piece
- **Minimum Order**: 10 units
- **Status**: In Stock

#### 2. USB-C Fast Charger
- **Price**: $8 USD / 20,000 TZS
- **Category**: Accessories
- **Unit**: Carton
- **Minimum Order**: 50 units
- **Status**: In Stock

#### 3. Screen Protector Pack
- **Price**: $2.50 USD / 6,250 TZS
- **Category**: Accessories
- **Unit**: Pack (10 pieces)
- **Minimum Order**: 100 units
- **Status**: In Stock

### Orders

#### Order #1 (Sample Order)
- **Status**: Confirmed
- **Importer**: Mwangi Trading Company
- **Supplier**: Hassan Electronics Wholesale
- **Items**:
  - 10x Samsung Galaxy A13 @ $150 = $1,500
  - 50x USB-C Charger @ $5 = $250
- **Subtotal**: $1,750 USD
- **Shipping**: $200 USD
- **Duty**: $300 USD
- **Total**: $2,250 USD (5,625,000 TZS)
- **Exchange Rate**: 2,500 TZS/USD
- **Estimated Delivery**: 14 days from creation
- **Notes**: Urgent delivery needed for retail stock

### Credit Line

#### Credit Line #1
- **Status**: Active
- **Lender**: Hassan Electronics Wholesale (Supplier)
- **Borrower**: Mwangi Trading Company (Importer)
- **Amount**: $2,250 USD (5,625,000 TZS)
- **Interest Rate**: 2.5% per month
- **Term**: 30 days
- **Due Date**: 30 days from creation

### Payments

#### Payment #1
- **Status**: Completed
- **Amount**: $1,125 USD (2,812,500 TZS)
- **Method**: M-Pesa
- **Transaction Reference**: TXN-2024-001
- **M-Pesa Receipt**: QEF61A8J5K
- **Platform Fee**: $16.88 USD
- **Paid By**: Mwangi Trading Company (Importer)

### Messages

#### Message 1 (Supplier → Importer)
- **Content**: "Your order has been confirmed. We will ship within 2 days."
- **Status**: Unread

#### Message 2 (Importer → Supplier)
- **Content**: "Great! Please expedite the shipping if possible."
- **Status**: Read

### Notifications

#### Notification 1 (For Importer)
- **Title**: Order Confirmed
- **Body**: Your order has been confirmed
- **Type**: Order Update

#### Notification 2 (For Supplier)
- **Title**: New Order Received
- **Body**: You have received a new order from Mwangi Trading Company
- **Type**: Order Update

---

## Testing Workflows

### 1. Supplier Workflow
**Login as Supplier** (supplier@malilink.test / TestPassword123!)

**Test Cases**:
- [ ] View supplier dashboard
- [ ] View all products
- [ ] View incoming orders
- [ ] Check order details
- [ ] View credit lines extended to importers
- [ ] Check payment status
- [ ] View messages from importers
- [ ] View supplier listing (Premium tier)
- [ ] Check supplier rating and reviews

### 2. Importer Workflow
**Login as Importer** (importer@malilink.test / TestPassword123!)

**Test Cases**:
- [ ] View importer dashboard
- [ ] Browse supplier products
- [ ] View product details
- [ ] Check order history
- [ ] View order status and tracking
- [ ] Check payment history
- [ ] View credit lines available
- [ ] Send messages to supplier
- [ ] View notifications

### 3. Admin Workflow
**Login as Admin** (admin@malilink.test / TestPassword123!)

**Test Cases**:
- [ ] Access admin dashboard
- [ ] View all users
- [ ] View all orders
- [ ] View all payments
- [ ] Check system statistics
- [ ] Manage user KYC status
- [ ] View platform metrics

---

## Feature Testing Checklist

### Authentication
- [ ] Login with valid credentials
- [ ] Login with invalid credentials (should fail)
- [ ] Logout functionality
- [ ] Password reset flow
- [ ] Session persistence

### Product Management
- [ ] View product catalog
- [ ] Filter products by category
- [ ] Search products
- [ ] View product details
- [ ] Check product availability
- [ ] View supplier information

### Orders
- [ ] Create new order
- [ ] Add items to order
- [ ] View order summary
- [ ] Submit order
- [ ] Track order status
- [ ] View order history
- [ ] Cancel order (if applicable)

### Payments
- [ ] View payment methods
- [ ] Process M-Pesa payment
- [ ] View payment history
- [ ] Check payment status
- [ ] Download payment receipt

### Credit System
- [ ] Request credit line
- [ ] View credit line terms
- [ ] Check credit line status
- [ ] View payment schedule
- [ ] Make credit payment

### Messaging
- [ ] Send message to user
- [ ] Receive message
- [ ] Mark message as read
- [ ] View message history
- [ ] Search messages

### Notifications
- [ ] Receive order notifications
- [ ] Receive payment notifications
- [ ] Receive credit notifications
- [ ] Mark notification as read
- [ ] Clear notifications

---

## Database Information

**Database Provider**: Railway PostgreSQL
**Database Host**: switchback.proxy.rlwy.net:22014
**Database Name**: railway
**Connection Status**: ✅ Active and Synced

### Tables Created
- users
- supplier_listings
- products
- orders
- order_items
- credit_lines
- payments
- messages
- whatsapp_sessions
- notifications

---

## Deployment Information

**Platform**: Vercel
**Production URL**: https://malilink.vercel.app
**Preview URL**: https://malilink-7xc42md80-godfrey-marikis-projects.vercel.app
**Framework**: Next.js 14.2.0
**Database**: Railway PostgreSQL

### Environment Variables Set
- ✅ DATABASE_URL (Railway PostgreSQL)
- ⚠️ NEXTAUTH_SECRET (Required)
- ⚠️ NEXTAUTH_URL (Set to production URL)
- ⚠️ TWILIO_ACCOUNT_SID (For WhatsApp bot)
- ⚠️ TWILIO_AUTH_TOKEN (For WhatsApp bot)
- ⚠️ TWILIO_WHATSAPP_NUMBER (For WhatsApp bot)
- ⚠️ MPESA_CONSUMER_KEY (For M-Pesa payments)
- ⚠️ MPESA_CONSUMER_SECRET (For M-Pesa payments)
- ⚠️ MPESA_PASSKEY (For M-Pesa payments)
- ⚠️ MPESA_SHORTCODE (For M-Pesa payments)

---

## Quick Start Guide

### 1. Access the Application
```
https://malilink.vercel.app
```

### 2. Login with Test Account
- Choose one of the three test accounts above
- Enter email and password
- Click Login

### 3. Explore Features
- Navigate through the dashboard
- Test different workflows based on your role
- Use the sample data to test order and payment flows

### 4. Test Different Roles
- Logout and login with different accounts
- Compare the features available for each role
- Test interactions between supplier and importer

---

## Known Test Scenarios

### Scenario 1: Complete Order Flow
1. Login as Importer
2. Browse supplier products
3. View the sample order (already created)
4. Check order status
5. View payment history
6. Check credit line terms

### Scenario 2: Supplier Management
1. Login as Supplier
2. View all products
3. Check incoming orders
4. View order details
5. Check payment status
6. View messages from importers

### Scenario 3: Credit System
1. Login as Importer
2. View active credit line
3. Check payment schedule
4. View due date and amount
5. Check payment history

### Scenario 4: Messaging
1. Login as Supplier
2. View messages from Importer
3. Reply to message
4. Check message status
5. Logout and login as Importer
6. View supplier's reply

---

## Troubleshooting

### Login Issues
- Ensure you're using the correct email and password
- Check that the email matches exactly (case-sensitive)
- Clear browser cache and try again

### Data Not Showing
- Refresh the page (Ctrl+R or Cmd+R)
- Check browser console for errors (F12)
- Verify database connection is active

### Payment Testing
- M-Pesa integration requires valid credentials
- Use test M-Pesa account for testing
- Check transaction reference for payment status

### WhatsApp Bot Testing
- Requires Twilio account setup
- Use WhatsApp test number for testing
- Check Twilio logs for message delivery

---

## Performance Testing

### Recommended Load Testing
- Test with 100+ concurrent users
- Monitor database response times
- Check API endpoint performance
- Verify image loading times

### Browser Compatibility
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile browsers

---

## Security Testing

### Test Cases
- [ ] SQL Injection attempts
- [ ] XSS (Cross-Site Scripting) attempts
- [ ] CSRF (Cross-Site Request Forgery) protection
- [ ] Authentication bypass attempts
- [ ] Authorization checks
- [ ] Password strength validation
- [ ] Session timeout
- [ ] Secure password storage (bcrypt)

---

## Notes for Testers

1. **Test Data Persistence**: All test data is stored in Railway PostgreSQL and will persist across sessions
2. **Password Security**: All test passwords are hashed using bcryptjs
3. **Email Verification**: Email verification is not required for test accounts
4. **Phone Verification**: Phone verification is not required for test accounts
5. **KYC Status**: All test accounts are pre-verified for testing purposes

---

## Support & Issues

If you encounter any issues during testing:
1. Check the browser console (F12) for error messages
2. Verify database connection status
3. Check Vercel deployment logs
4. Review application logs in Railway dashboard

---

**Last Updated**: March 8, 2026
**Test Data Created**: March 8, 2026
**Status**: ✅ Ready for Testing
