import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import User from "../models/User.js";
import Account from "../models/Account.js";

const router = Router();

const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(128),
  phone: z.string().min(7).max(30).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

function signToken(user) {
  return jwt.sign(
    { userId: user._id.toString(), role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "15m" }
  );
}

function publicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone || null,
    role: user.role,
    kycStatus: user.kycStatus,
    biometricEnabled: user.biometricEnabled,
  };
}

router.post("/register", async (req, res, next) => {
  try {
    const data = registerSchema.parse(req.body);
    const email = data.email.toLowerCase();

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "An account with this email already exists" });
    }

    const passwordHash = await bcrypt.hash(data.password, 12);
    const user = await User.create({
      name: data.name,
      email,
      phone: data.phone,
      passwordHash,
    });

    let accountNumber;
    do {
      accountNumber = `30${Math.floor(100000000 + Math.random() * 900000000)}`;
    } while (await Account.exists({ accountNumber }));

    await Account.create({ userId: user._id, accountNumber, currency: "NGN" });

    return res.status(201).json({
      message: "Account created successfully",
      token: signToken(user),
      user: publicUser(user),
      account: { accountNumber, currency: "NGN", availableBalance: 0 },
    });
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({ message: "Invalid registration details", errors: error.issues });
    }
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const data = loginSchema.parse(req.body);
    const user = await User.findOne({ email: data.email.toLowerCase() });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (user.isFrozen) {
      return res.status(403).json({ message: "Your account is frozen" });
    }

    const valid = await bcrypt.compare(data.password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    user.lastLoginAt = new Date();
    await user.save();

    return res.json({
      message: "Login successful",
      token: signToken(user),
      user: publicUser(user),
    });
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({ message: "Invalid login details", errors: error.issues });
    }
    next(error);
  }
});

export default router;
