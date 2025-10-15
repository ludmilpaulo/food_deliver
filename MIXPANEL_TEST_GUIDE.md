# Mixpanel Integration Test Guide - Web App (food_deliver)

## Overview
This guide helps you test the Mixpanel integration across the Kudya web application.

## Configuration
- **Token**: `a8cf933c3054afed7f397f71249ba506`
- **Features Enabled**: 
  - Autocapture: `true`
  - Session Recording: `100%`

## Test Scenarios

### 1. Authentication Flow

#### Login Test
1. Navigate to `/LoginScreenUser`
2. **Expected Event**: `Page View` with page = "Login Page"
3. Fill in credentials and submit
4. **Expected Events**:
   - Success: `User Login` with user_type = "customer" or "store", platform = "web"
   - Failure: `Error Occurred` with error_message = "Login Failed"

#### Signup Test
1. Navigate to `/SignupScreen`
2. **Expected Event**: `Page View` with page = "Signup Page"
3. Complete signup form and submit
4. **Expected Events**:
   - Success: `User Signup` with name, email, user_type, platform = "web"
   - Failure: `Error Occurred` with error_message = "Signup Failed"

### 2. Home Screen
1. Navigate to `/HomeScreen`
2. **Expected Event**: `Page View` with page = "Home Screen"
3. Browse stores and products

### 3. Shopping Flow

#### Cart Test
1. Add products to cart
2. Navigate to `/CartPage`
3. **Expected Event**: `Page View` with page = "Cart Page", items_count
4. Remove an item
5. **Expected Event**: `Product Removed from Cart` with product_id, product_name

#### Checkout Test
1. Navigate to `/Checkout`
2. **Expected Events**:
   - `Page View` with page = "Checkout Page"
   - `Checkout Started` with cart_value, item_count
3. Complete checkout
4. **Expected Events**:
   - Success: `Order Completed` with order_id, order_value, item_count
   - Failure: `Error Occurred` with error_message = "Order Failed"

## Verification Steps

### Browser Console
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for Mixpanel logs showing tracked events

### Mixpanel Dashboard
1. Log in to [Mixpanel](https://mixpanel.com)
2. Go to your project
3. Navigate to Events → Live View
4. Verify events are appearing in real-time

### Check Session Recording
1. In Mixpanel, go to Session Replay
2. Find your recent sessions
3. Verify that user interactions are being recorded

## Common Issues

### Events Not Showing
- Check if Mixpanel token is correct
- Verify browser is not blocking third-party scripts
- Check Console for errors

### Session Recording Not Working
- Ensure `record_sessions_percent: 100` is set
- Check if user gave consent for tracking
- Verify Mixpanel plan includes session replay

## Event Properties to Verify

### User Properties
- `$name`: User's name
- `$email`: User's email
- `user_type`: "customer" or "store"
- `platform`: "web"

### Event-Specific Properties
- **Login/Signup**: user_id, user_type, platform
- **Page Views**: page name
- **Orders**: order_id, order_value, item_count
- **Cart Actions**: product_id, product_name, price, quantity
- **Errors**: error_message, error_details

## Success Criteria
✅ All page views tracked correctly
✅ User authentication events recorded
✅ Shopping flow events captured
✅ Error events logged with details
✅ User properties set correctly
✅ Session recordings available in Mixpanel

