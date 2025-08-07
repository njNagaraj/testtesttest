import CatalystService from '../services/catalyst.js';

const authMiddleware = async (req, res, next) => {
  try {
    // In a real Catalyst environment, the context would be available
    // For now, we'll simulate authentication with headers
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);
    
    // In a real implementation, you would validate the token with Catalyst
    // For demo purposes, we'll use a simple validation
    if (!token || token === 'undefined') {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Simulate user data (in real app, this would come from Catalyst)
    req.user = {
      id: 'user_123',
      email: 'demo@example.com',
      first_name: 'Demo',
      last_name: 'User',
      org_id: 'org_456'
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ error: 'Authentication failed' });
  }
};

export default authMiddleware;