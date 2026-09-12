import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Account from '../models/Account.js';

const router = Router();
const token = (user) => jwt.sign({ sub: user._id.toString(), role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '15m' });
const accountNumber = () => `30${Math.floor(100000000 + Math.random() * 900000000)}`;

router.post('/register', async (req, res, next) => {
  try {
    const { name, email, phone, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'Name, email and password are required' });
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(409).json({ message: 'Email already registered' });
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email: email.toLowerCase(), phone, passwordHash });
    await Account.create({ userId: user._id, accountNumber: accountNumber() });
    res.status(201).json({ token: token(user), user: { id: user._id, name: user.name, email: user.email } });
  } catch (e) { next(e); }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase() });
    if (!user || !(await bcrypt.compare(password || '', user.passwordHash))) return res.status(401).json({ message: 'Invalid email or password' });
    if (user.isFrozen) return res.status(423).json({ message: 'Account is frozen' });
    user.lastLoginAt = new Date(); await user.save();
    res.json({ token: token(user), user: { id: user._id, name: user.name, email: user.email, kycStatus: user.kycStatus } });
  } catch (e) { next(e); }
});

export default router;
