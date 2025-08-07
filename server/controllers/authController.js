import CatalystService from '../services/catalyst.js';

const authController = {
  async register(req, res) {
    try {
      const { firstName, lastName, email, password } = req.body;

      if (!firstName || !lastName || !email) {
        return res.status(400).json({ 
          error: 'First name, last name, and email are required' 
        });
      }

      // In a real Catalyst environment, you would use the actual Catalyst service
      // For demo purposes, we'll simulate user registration
      const mockUser = {
        id: `user_${Date.now()}`,
        first_name: firstName,
        last_name: lastName,
        email_id: email,
        created_time: new Date().toISOString(),
        status: 'CONFIRMED'
      };

      // Simulate token generation
      const token = Buffer.from(`${email}:${Date.now()}`).toString('base64');

      res.status(201).json({
        success: true,
        user: mockUser,
        token,
        message: 'User registered successfully'
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ 
        error: 'Registration failed', 
        details: error.message 
      });
    }
  },

  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ 
          error: 'Email and password are required' 
        });
      }

      // In a real implementation, you would validate credentials with Catalyst
      // For demo purposes, we'll simulate successful login
      const mockUser = {
        id: 'user_123',
        first_name: 'Demo',
        last_name: 'User',
        email_id: email,
        org_id: 'org_456',
        created_time: new Date().toISOString(),
        status: 'CONFIRMED'
      };

      const token = Buffer.from(`${email}:${Date.now()}`).toString('base64');

      res.json({
        success: true,
        user: mockUser,
        token,
        message: 'Login successful'
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ 
        error: 'Login failed', 
        details: error.message 
      });
    }
  },

  async logout(req, res) {
    try {
      // In a real implementation, you might invalidate the token in Catalyst
      res.json({
        success: true,
        message: 'Logout successful'
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ 
        error: 'Logout failed', 
        details: error.message 
      });
    }
  },

  async getCurrentUser(req, res) {
    try {
      // Return the user from auth middleware
      res.json({
        success: true,
        user: req.user
      });
    } catch (error) {
      console.error('Get current user error:', error);
      res.status(500).json({ 
        error: 'Failed to get user details', 
        details: error.message 
      });
    }
  }
};

export default authController;