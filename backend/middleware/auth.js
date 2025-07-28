const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, name: true }
    });

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

const requireCompany = async (req, res, next) => {
  try {
    const company = await prisma.company.findFirst({
      where: { id: req.params.companyId || req.body.companyId }
    });

    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    req.company = company;
    next();
  } catch (error) {
    return res.status(500).json({ error: 'Error validating company' });
  }
};

module.exports = { authenticateToken, requireCompany }; 