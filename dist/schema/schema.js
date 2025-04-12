"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookSchema = exports.adminLogin = exports.adminSchema = exports.userLogin = exports.userSchema = void 0;
const zod_1 = __importDefault(require("zod"));
exports.userSchema = zod_1.default.object({
    name: zod_1.default.string().min(2),
    username: zod_1.default.string().min(5),
    password: zod_1.default.string().min(7)
});
exports.userLogin = zod_1.default.object({
    username: zod_1.default.string().min(5),
    password: zod_1.default.string().min(7)
});
exports.adminSchema = zod_1.default.object({
    name: zod_1.default.string().min(2),
    username: zod_1.default.string(),
    password: zod_1.default.string().min(7)
});
exports.adminLogin = zod_1.default.object({
    username: zod_1.default.string().min(5),
    password: zod_1.default.string().min(7)
});
exports.BookSchema = zod_1.default.object({
    name: zod_1.default.string().min(1),
    authorName: zod_1.default.string().min(2)
});
