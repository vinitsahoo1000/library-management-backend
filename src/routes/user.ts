import express,{Request,Response} from "express";
import { userLogin, userSchema } from "../schema/schema";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { authMiddleware } from "../middleware/middleware";

export const userRouter = express.Router();

const prisma = new PrismaClient();

const jwt_secret = process.env.JWT_SECRET;

userRouter.post('/signup',async(req:Request,res:Response):Promise<any>=>{
    try{
        const signupBody = userSchema.parse(req.body);
        
        const isUser = await prisma.user.findFirst({
            where:{
                username: signupBody.username
            }
        })

        if(isUser){
            return res.status(409).json({
                message: "User already exists with this username"
            })
        }

        const hashedPassword = await bcrypt.hash(signupBody.password,10);

        const newUser = await prisma.user.create({
            data:{
                name: signupBody.name,
                username: signupBody.username,
                password: hashedPassword
            }
        })

        const token = jwt.sign({
                id: newUser.id, username: newUser.username,type:"user"},
                jwt_secret!)

        return res.status(201).json({
            message: "User signed-up successfully!!!",
            token: token
        })

    }catch(error:any){
        if(error instanceof z.ZodError){
            return res.status(400).json({
            message:"Invalid input",
            error: error.errors
        })
        }

        return res.status(500).json({
            error: "Internal Server Error!!!"
        })

    }
})

userRouter.post('/login',async(req:Request,res:Response):Promise<any>=>{
    try{
        const payload = userLogin.parse(req.body)
        const user = await prisma.user.findFirst({
                where:{
                    username: payload.username
                }
            })
        
        if(!user){
            return res.status(400).json({message:"User not found"})
        }

        const passwordMatch = await bcrypt.compare(payload.password,user.password)
        if(!passwordMatch){
            return res.status(400).json({message:"Invalid password"})
        }

        const token = jwt.sign({userId:user.id,email:user.username,type:"user"},jwt_secret!)
        res.send({
        msg: "User logged in successfully!!",
        token: token
    })

    }catch(e){
        if(e instanceof z.ZodError){
            return res.status(400).json({
            message:"Invalid input",
            error: e.errors
        })
        }

        console.error(e);
        res.status(500).json({message:"Internal server error"})
    }
})


userRouter.get('/verify',authMiddleware,async(req:Request,res:Response):Promise<any>=>{
    try{
        const username = req.username;
        const userId = req.id;
    
        res.send({
            msg: "User verified successfully!!",
            username: username,
            userId: userId
        })}
        catch(e){
            console.error(e);
            res.status(500).json({message:"Internal server error"})
        }
})