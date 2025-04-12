"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRouter = void 0;
const express_1 = __importDefault(require("express"));
const schema_1 = require("../schema/schema");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const middleware_1 = require("../middleware/middleware");
exports.userRouter = express_1.default.Router();
const prisma = new client_1.PrismaClient();
const jwt_secret = process.env.JWT_SECRET;
exports.userRouter.post('/signup', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const signupBody = schema_1.userSchema.parse(req.body);
        const isUser = yield prisma.user.findFirst({
            where: {
                username: signupBody.username
            }
        });
        if (isUser) {
            return res.status(409).json({
                message: "User already exists with this username"
            });
        }
        const hashedPassword = yield bcrypt_1.default.hash(signupBody.password, 10);
        const newUser = yield prisma.user.create({
            data: {
                name: signupBody.name,
                username: signupBody.username,
                password: hashedPassword
            }
        });
        const token = jsonwebtoken_1.default.sign({
            id: newUser.id, username: newUser.username, type: "user"
        }, jwt_secret);
        return res.status(201).json({
            message: "User signed-up successfully!!!",
            token: token
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({
                message: "Invalid input",
                error: error.errors
            });
        }
        return res.status(500).json({
            error: "Internal Server Error!!!"
        });
    }
}));
exports.userRouter.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const payload = schema_1.userLogin.parse(req.body);
        const user = yield prisma.user.findFirst({
            where: {
                username: payload.username
            }
        });
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }
        const passwordMatch = yield bcrypt_1.default.compare(payload.password, user.password);
        if (!passwordMatch) {
            return res.status(400).json({ message: "Invalid password" });
        }
        const token = jsonwebtoken_1.default.sign({ userId: user.id, email: user.username, type: "user" }, jwt_secret);
        res.send({
            msg: "User logged in successfully!!",
            token: token
        });
    }
    catch (e) {
        if (e instanceof zod_1.z.ZodError) {
            return res.status(400).json({
                message: "Invalid input",
                error: e.errors
            });
        }
        console.error(e);
        res.status(500).json({ message: "Internal server error" });
    }
}));
exports.userRouter.get('/verify', middleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const username = req.username;
        const userId = req.id;
        res.send({
            msg: "User verified successfully!!",
            username: username,
            userId: userId
        });
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ message: "Internal server error" });
    }
}));
