const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - require authentication
const protect = async (req, res, next) => {
  let token;

  try {
    // Get token from header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    // Get token from cookie
    else if (req.cookies.token) {
      token = req.cookies.token;
    }

    // Make sure token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Get user from token
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }

      // Check if user is active
      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Account has been deactivated'
        });
      }

      // Check if account is locked
      if (user.isLocked) {
        return res.status(423).json({
          success: false,
          message: 'Account is temporarily locked due to too many failed login attempts'
        });
      }

      // Check if email is verified (optional - can be configured)
      if (process.env.REQUIRE_EMAIL_VERIFICATION === 'true' && !user.isEmailVerified) {
        return res.status(401).json({
          success: false,
          message: 'Please verify your email address'
        });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error('Token verification error:', error);
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Grant access to specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user.role}' is not authorized to access this route`
      });
    }
    next();
  };
};

// Optional authentication - doesn't fail if no token
const optionalAuth = async (req, res, next) => {
  let token;

  try {
    // Get token from header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    // Get token from cookie
    else if (req.cookies.token) {
      token = req.cookies.token;
    }

    if (token) {
      try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Get user from token
        const user = await User.findById(decoded.id).select('-password');
        
        if (user && user.isActive && !user.isLocked) {
          req.user = user;
        }
      } catch (error) {
        // Token is invalid, but that's okay for optional auth
        console.log('Optional auth: Invalid token');
      }
    }

    next();
  } catch (error) {
    console.error('Optional auth middleware error:', error);
    next();
  }
};

// Check if user owns the resource
const checkResourceOwnership = (resourceField = 'user') => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Not authorized to access this route'
        });
      }

      // Admin can access all resources
      if (req.user.role === 'admin') {
        return next();
      }

      // For routes with ID parameter, check ownership
      if (req.params.id) {
        // This is a generic middleware, specific models should be checked in controllers
        req.checkOwnership = {
          userId: req.user._id,
          resourceField: resourceField
        };
      }

      next();
    } catch (error) {
      console.error('Resource ownership check error:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  };
};

// Rate limiting per user
const userRateLimit = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  const requests = new Map();

  return (req, res, next) => {
    if (!req.user) {
      return next();
    }

    const userId = req.user._id.toString();
    const now = Date.now();
    const windowStart = now - windowMs;

    // Get or create user request history
    if (!requests.has(userId)) {
      requests.set(userId, []);
    }

    const userRequests = requests.get(userId);

    // Remove old requests outside the window
    const validRequests = userRequests.filter(timestamp => timestamp > windowStart);
    requests.set(userId, validRequests);

    // Check if user has exceeded the limit
    if (validRequests.length >= maxRequests) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests. Please try again later.',
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }

    // Add current request
    validRequests.push(now);
    requests.set(userId, validRequests);

    next();
  };
};

// Check if user can perform action on their own account
const checkSelfOrAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    const targetUserId = req.params.userId || req.params.id;
    
    // User can access their own data or admin can access any data
    if (req.user._id.toString() === targetUserId || req.user.role === 'admin') {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: 'Not authorized to access this resource'
    });
  } catch (error) {
    console.error('Self or admin check error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Validate API key (for external integrations)
const validateApiKey = async (req, res, next) => {
  try {
    const apiKey = req.headers['x-api-key'] || req.query.apiKey;

    if (!apiKey) {
      return res.status(401).json({
        success: false,
        message: 'API key is required'
      });
    }

    // In production, you'd validate against a database of API keys
    if (apiKey !== process.env.API_KEY) {
      return res.status(401).json({
        success: false,
        message: 'Invalid API key'
      });
    }

    req.apiAccess = true;
    next();
  } catch (error) {
    console.error('API key validation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Two-factor authentication check
const requireTwoFactor = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    // If user has 2FA enabled, check if they've completed 2FA for this session
    if (req.user.twoFactorAuth && req.user.twoFactorAuth.enabled) {
      const twoFactorVerified = req.session?.twoFactorVerified;
      
      if (!twoFactorVerified) {
        return res.status(423).json({
          success: false,
          message: 'Two-factor authentication required',
          requiresTwoFactor: true
        });
      }
    }

    next();
  } catch (error) {
    console.error('Two-factor auth check error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Update last login time
const updateLastLogin = async (req, res, next) => {
  try {
    if (req.user) {
      // Update last login time without validation
      await User.findByIdAndUpdate(
        req.user._id,
        { lastLogin: new Date() },
        { validateBeforeSave: false }
      );
    }
    next();
  } catch (error) {
    console.error('Update last login error:', error);
    // Don't fail the request if this fails
    next();
  }
};

module.exports = {
  protect,
  authorize,
  optionalAuth,
  checkResourceOwnership,
  userRateLimit,
  checkSelfOrAdmin,
  validateApiKey,
  requireTwoFactor,
  updateLastLogin
};