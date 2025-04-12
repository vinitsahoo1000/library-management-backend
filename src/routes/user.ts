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


userRouter.get('/allBooks',authMiddleware,async(req:Request,res:Response):Promise<any>=>{
    try{
        const allBooks = await prisma.book.findMany({})

        return res.json({
            books: allBooks
        })

    }catch(error){
        return res.status(500).send({
            msg: "Internal Server error!!!"
        })

    }
})


userRouter.put('/rent/:id',authMiddleware,async(req:Request,res:Response):Promise<any>=>{
    try{
        const bookId = req.params.id;
        const userId = req.id;

        const book = await prisma.book.findFirst({
            where:{
                id: bookId
            }
        })

        if(book?.rented === true){
            return res.json({
                message: "Book is already rented!!!"
            })
        }

        const isUserAlreadyRented = await prisma.rented.findFirst({
            where:{
                UserId: userId!
            }
        })

        if(isUserAlreadyRented){
            return res.json({
                message: "You have already rented a book"
            })
        }

        await prisma.rented.create({
            data:{
                UserId: userId!,
                BookId: bookId
            }
        })

        await prisma.book.update({
            where:{
                id: bookId
            },
            data:{
                rented: true
            }
        })

        return res.json({
            message: "Book is rented successfully!!!!"
        })

    }catch(error){
        return res.status(500).send({
            message: "Internal server error!!!!"
        })
    }
})


userRouter.put("/return-book",authMiddleware,async(req:Request,res:Response):Promise<any>=>{
    try{
        const userId = req.id

        const isUserRented = await prisma.rented.findFirst({
            where:{
                UserId: userId
            }
        })

        if(!isUserRented){
            return res.send({
                message: "You have not rented any book!!"
            })
        }

        await prisma.book.update({
            where:{
                id: isUserRented.BookId
            },
            data:{
                rented: false
            }
        })

        await prisma.rented.delete({
            where:{
                id: isUserRented.id
            }
        })

        return res.json({
            message: "Book returned succesfully!!!!"
        })

    }catch(error){
        return res.status(500).send({
            message: "Internal server error!!!"
        })

    }
})