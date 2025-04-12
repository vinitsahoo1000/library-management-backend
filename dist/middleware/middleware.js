"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers['authorization'] || "";
    if (!authHeader) {
        res.status(401).send({
            error: "Authorization header missing."
        });
        return;
    }
    const jwtToken = authHeader.split(' ')[1];
    if (!jwtToken) {
        res.status(401).send({
            error: "Authorization header missing."
        });
        return;
    }
    jsonwebtoken_1.default.verify(jwtToken, process.env.JWT_SECRET, (err, decoded) => {
        if (err || !decoded) {
            res.status(403).send({
                error: "Invalid token. Access denied"
            });
            return;
        }
        const payload = decoded;
        console.log(payload);
        req.id = payload.userId;
        req.username = payload.email;
        req.type = payload.type;
        next();
    });
};
exports.authMiddleware = authMiddleware;
