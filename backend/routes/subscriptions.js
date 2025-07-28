const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const auth = require('../middleware/auth');

// Subscription plans
const PLANS = {
  basic: {
    id: 'price_basic_monthly',
    name: 'Basic Plan',
    price: 999, // £9.99 in pence
    features: [
      'Up to 50 invoices per month',
      'Basic reporting',
      'PDF export',
      'Email support'
    ]
  },
  premium: {
    id: 'price_premium_monthly', 
    name: 'Premium Plan',
    price: 1999, // £19.99 in pence
    features: [
      'Unlimited invoices',
      'Advanced reporting',
      'Custom branding',
      'API access',
      'Priority support',
      'VAT reporting',
      'Expense tracking',
      'MTD Quarterly Reports',
      'HMRC VAT Returns',
      'Making Tax Digital Compliance'
    ]
  }
};

// Create checkout session
router.post('/create-checkout-session', auth, async (req, res) => {
  try {
    const { plan } = req.body;
    const planConfig = PLANS[plan];
    
    if (!planConfig) {
      return res.status(400).json({ error: 'Invalid plan' });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: planConfig.name,
              description: planConfig.features.join(', ')
            },
            unit_amount: planConfig.price,
            recurring: {
              interval: 'month'
            }
          },
          quantity: 1
        }
      ],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/subscription/cancel`,
      customer_email: req.user.email,
      metadata: {
        userId: req.user.id,
        plan: plan
      }
    });

    res.json({ sessionId: session.id });
  } catch (error) {
    console.error('Stripe error:', error);
    res.status(500).json({ error: 'Payment setup failed' });
  }
});

// Get subscription status
router.get('/status', auth, async (req, res) => {
  try {
    // In a real app, you'd store subscription info in your database
    // For now, return mock data
    res.json({
      hasSubscription: false,
      plan: null,
      status: 'inactive'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get subscription status' });
  }
});

// Cancel subscription
router.post('/cancel', auth, async (req, res) => {
  try {
    // In a real app, you'd cancel the Stripe subscription
    res.json({ message: 'Subscription cancelled' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
});

module.exports = router; 