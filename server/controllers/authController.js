const authController = {
  async register(req, res) {
    try {
      const { firstName, lastName, email } = req.body;
      const catalyst = req.catalyst;

      if (!firstName || !lastName || !email) {
        return res.status(400).json({
          error: 'First name, last name, and email are required',
        });
      }

      const userManagement = catalyst.userManagement();
      const userConfig = {
        first_name: firstName,
        last_name: lastName,
        email_id: email,
      };

      const signupConfig = {
        platform_type: 'web',
        redirect_url: 'http://localhost:5173/dashboard',
      };

      const userDetails = await userManagement.registerUser(signupConfig, userConfig);

      res.status(201).json({
        success: true,
        user: userDetails,
        message: 'Registration initiated. Please check your email to confirm.',
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        error: 'Registration failed',
        details: error.message,
      });
    }
  },

  async login(req, res) {
    // Catalyst handles login via its own mechanisms (hosted components or client SDK)
    // This endpoint is to fetch user details after they have logged in on the client
    // and the client has a valid Catalyst token.
    try {
      const catalyst = req.catalyst;
      const userManagement = catalyst.userManagement();
      const currentUser = await userManagement.getCurrentUser();

      if (!currentUser) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      res.json({
        success: true,
        user: currentUser,
        message: 'Login successful',
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        error: 'Login failed',
        details: error.message,
      });
    }
  },

  async logout(req, res) {
    try {
      // In a real implementation, you might need to sign out from the client-side
      // The server-side token becomes invalid automatically after expiry
      res.json({
        success: true,
        message: 'Logout successful',
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        error: 'Logout failed',
        details: error.message,
      });
    }
  },

  async getCurrentUser(req, res) {
    try {
      const catalyst = req.catalyst;
      const userManagement = catalyst.userManagement();
      const user = await userManagement.getCurrentUser();

      if (!user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      res.json({
        success: true,
        user: user,
      });
    } catch (error) {
      console.error('Get current user error:', error);
      res.status(500).json({
        error: 'Failed to get user details',
        details: error.message,
      });
    }
  },
};

export default authController;