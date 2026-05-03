import { User } from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import { generateAccessAndRefreshToken } from '../helpers/jwt.js';

const IS_PROD = process.env.NODE_ENV === 'production';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure:   IS_PROD,
  sameSite: IS_PROD ? 'none' : 'lax',
  maxAge:   7 * 24 * 60 * 60 * 1000,
};

const sanitizeUser = (user) => ({
  id:       user._id,
  name:     user.name,
  username: user.username,
  email:    user.email,
  image:    user?.image || null,
});

// ── Register ──────────────────────────────────────────────────
export const register = async (req, res) => {
  try {
    const { name, username, email, password } = req.body;
    const user = await User.create({ name, username, email, password });
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

    res.status(201)
      .cookie('accessToken',  accessToken,  COOKIE_OPTIONS)
      .cookie('refreshToken', refreshToken, COOKIE_OPTIONS)
      .json({
        success:     'Registered Successfully',
        user:        sanitizeUser(user),
        accessToken, // ← also in body for socket.io
      });
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ error: `This ${field} is already registered.` });
    }
    res.status(400).json({ error: error.message });
  }
};

// ── Login ─────────────────────────────────────────────────────
export const login = async (req, res) => {
  try {
    const { usernameOrEmail, password } = req.body;
    const user = await User.findOne({
      $or: [{ email: usernameOrEmail }, { username: usernameOrEmail }],
    });

    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const match = user.password && (await bcrypt.compare(password, user.password));
    if (!match)  return res.status(401).json({ error: 'Invalid credentials' });

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

    res.status(200)
      .cookie('accessToken',  accessToken,  COOKIE_OPTIONS)
      .cookie('refreshToken', refreshToken, COOKIE_OPTIONS)
      .json({
        success:     'Logged In',
        user:        sanitizeUser(user),
        accessToken, // ← also in body for socket.io
      });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ── Logout ────────────────────────────────────────────────────
export const logout = async (req, res) => {
  try {
    const clearOptions = { httpOnly: true, secure: IS_PROD, sameSite: IS_PROD ? 'none' : 'lax', maxAge: 0 };
    res.status(200)
      .clearCookie('accessToken',  clearOptions)
      .clearCookie('refreshToken', clearOptions)
      .json({ success: 'Logged Out Successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ── Google OAuth Callback ─────────────────────────────────────
export const googleAuthCallback = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(req.user._id);

    const userPayload = sanitizeUser(user);
    const frontendURL = process.env.FRONTEND_URL || 'http://localhost:5173';

    // Set cookies then redirect to frontend with user data + token in query params
    res
      .cookie('accessToken',  accessToken,  COOKIE_OPTIONS)
      .cookie('refreshToken', refreshToken, COOKIE_OPTIONS)
      .redirect(
        `${frontendURL}/auth/callback?token=${accessToken}&user=${encodeURIComponent(JSON.stringify(userPayload))}`
      );
  } catch (error) {
    const frontendURL = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendURL}/login?error=google_auth_failed`);
  }
};

// ── Find User by Email (for contact preview) ──────────────────
export const findUserByEmail = async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const user = await User.findOne({ email: email.toLowerCase() }).select('name username email');
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Don't return yourself
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({ error: 'That is your own account' });
    }

    res.json({ id: user._id, name: user.name, username: user.username, email: user.email });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ── Reset Password (no token — direct email + new password) ──
export const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({ error: 'Email and new password are required.' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ error: 'No account found with this email.' });
    }

    // Update password — the pre-save hook in user.model.js will hash it
    user.password = newPassword;
    await user.save();

    res.json({ success: 'Password reset successfully. You can now log in.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};