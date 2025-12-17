import express from 'express';
import { VerifyToken } from '../middleware/auth.middleware.js';
import { checkIsAuth, login, logout, register } from '../controllers/auth.controller.js';

const router = express.Router();

router.get("/is-auth", VerifyToken, checkIsAuth);

router.post("/register", register);
router.post("/login", login);
router.post("/logout", VerifyToken, logout);

export default router;