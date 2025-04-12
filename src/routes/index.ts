import express from "express";
import { userRouter } from "./user";
import { adminRouter } from "./admin";

export const mainRouter = express.Router();

mainRouter.use('/user',userRouter);
mainRouter.use('/admin',adminRouter);