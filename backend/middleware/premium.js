const auth = require('./auth');

// Premium feature middleware
const requirePremium = (req, res, next) => {
  try {
    // For demo purposes, we'll do a simple check
    // In a real app, you'd verify the auth token and check subscription status
    
    // Mock premium check - replace with actual database query
    const hasPremium = req.headers['x-premium-user'] === 'true' || 
                      req.headers['authorization']?.includes('admin@invoicemate.com');
    
    if (!hasPremium) {
      return res.status(403).json({ 
        error: 'Premium subscription required',
        message: 'This feature requires a Premium subscription. Upgrade to access HMRC reporting and MTD compliance features.',
        upgradeUrl: '/subscription',
        features: [
          'MTD Quarterly Reports',
          'HMRC VAT Returns',
          'Making Tax Digital Compliance',
          'Advanced Expense Tracking',
          'Custom Branding',
          'Priority Support'
        ]
      });
    }

    next();
  } catch (error) {
    console.error('Premium middleware error:', error);
    res.status(500).json({ error: 'Premium check failed' });
  }
};

// Optional premium - allows access but shows upgrade prompt
const optionalPremium = async (req, res, next) => {
  try {
    // First check if user is authenticated
    await auth(req, res, (err) => {
      if (err) {
        return res.status(401).json({ error: 'Authentication required' });
      }
    });

    // Check subscription status
    const hasPremium = req.headers['x-premium-user'] === 'true' || 
                      req.user?.email === 'admin@invoicemate.com';
    
    // Add premium status to request for frontend to use
    req.hasPremium = hasPremium;
    
    next();
  } catch (error) {
    console.error('Optional premium middleware error:', error);
    res.status(500).json({ error: 'Premium check failed' });
  }
};

module.exports = { requirePremium, optionalPremium }; 