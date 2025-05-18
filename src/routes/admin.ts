import {Request,Response,Router} from "express";
import { adminLogin, BookSchema, EditBookSchema, userSchema } from "../schema/schema";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { z, ZodError } from "zod";
import { authMiddleware } from "../middleware/middleware";
import cloudinary from "../config/config";
import multer from "multer";

export const adminRouter = Router();

const prisma = new PrismaClient();
const jwt_secret = process.env.JWT_SECRET;
const upload = multer({dest:"uploads/"});

adminRouter.post('/signup',async(req:Request,res:Response):Promise<any>=>{
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
                        userId: newUser.id, username: newUser.username},
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

adminRouter.post('/login', async(req:Request,res:Response):Promise<any>=>{
    try{
        const payload = adminLogin.parse(req.body)
        const user = await prisma.user.findFirst({
                where:{
                    username: payload.username,
                    role: "ADMIN"
                }
            })
            
        if(!user){
            return res.status(400).json({message:"Admin not found"})
        }

    
        const passwordMatch = await bcrypt.compare(payload.password,user.password)
        if(!passwordMatch){
            return res.status(400).json({message:"Invalid password"})
        }
    
        const token = jwt.sign({userId:user.id,email:user.username},jwt_secret!)
        res.json({
        msg: "Admin logged in successfully!!",
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

adminRouter.get('/verify',authMiddleware,async(req:Request,res:Response):Promise<any>=>{
    try{
        const username = req.username;
        const userId = req.id;
        

        const user = await prisma.user.findUnique({
            where: {
                id: userId,
                role: "ADMIN"
            }
        })

        if(!user){
            return res.status(400).json({ msg: "Admin not found !!!" })
        }

        if(user.role !== "ADMIN"){
            return res.status(400).json({ error: "Forbidden: Admin access only" })
        }

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


adminRouter.post('/addBook',authMiddleware,upload.single("coverPhoto"),async(req:Request,res:Response):Promise<any>=>{
    try{        
        const bookPayload = BookSchema.parse(req.body);
        const adminId = req.id;

        const admin = await prisma.user.findUnique({
            where: {
                id: adminId,
                role: "ADMIN"
            }
        })

        if(!admin){
            return res.status(400).json({ error: "Forbidden: Admin access only" })
        }

        let coverPhotoUrl = null;

        if(req.file){
            const result = await cloudinary.uploader.upload(req.file.path,{
                folder:'cover-photos',
                resource_type:'image'
            })
            coverPhotoUrl = result.secure_url;
        }

        const newBook = await prisma.book.create({
            data:{
                name: bookPayload.name,
                authorName: bookPayload.authorName,
                adminId: adminId!,
                imageUrl: coverPhotoUrl!
            }
        })

        return res.status(200).json({
            message: "Book uploaded successfully!!!",
            book: newBook
        })

    }catch(error){
        return res.status(500).json({
            message: "Internal server error!!!",
            error: error
        })
    }
})


adminRouter.put('/editBook/:bookId',authMiddleware,async(req:Request,res:Response):Promise<any>=>{
    try{
        const adminId = req.id;
        const bookId = req.params.bookId;

        const bookPayload = EditBookSchema.parse(req.body)

        const admin = await prisma.user.findUnique({
            where:{
                id: adminId,
                role: "ADMIN"
            }
        })  

        if(!admin){
            return res.status(400).json({ error: "Forbidden: Admin access only" })
        }

        const book = await prisma.book.findUnique({
            where:{
                id: bookId,
                adminId: adminId
            }
        })

        if(!book){
            return res.status(400).json({
                message: "You dont own this book!!!"
            })
        }

        await prisma.book.update({
            where:{
                id: bookId
            },
            data:{
                name: bookPayload.name,
                authorName: bookPayload.authorName
            }
        })

        return res.json({
            message: "Book updated successfully!!!"
        })
    }catch(error){
        if(error instanceof ZodError){
            return res.status(400).json({
                message: "Invalid input!!!"
            })
        }

        return res.status(500).json({
            message: "Internal server error!!!",
            error: error
        })
    }
})


adminRouter.put('/editCoverPhoto/:bookId',authMiddleware,upload.single("coverPhoto"),async(req:Request,res:Response):Promise<any>=>{
    try{
        const adminId = req.id;
        const bookId = req.params.bookId;

        const admin = await prisma.user.findUnique({
            where: {
                id: adminId,
                role: "ADMIN"
            }
        })

        if(!admin){
            return res.status(400).json({ error: "Forbidden: Admin access only" })
        }

        const book = await prisma.book.findUnique({
            where:{
                id: bookId,
                adminId: adminId
            }
        })

        if(!book){
            return res.status(400).json({
                message: "You dont own this book!!!"
            })
        }

        let coverPhotoUrl = null;

        if(req.file){
            const result = await cloudinary.uploader.upload(req.file.path,{
            folder:'cover-photos',
            resource_type:'image'
        })
            coverPhotoUrl = result.secure_url;
        }

        await prisma.book.update({
            where:{
                id: bookId
            },
            data:{
                imageUrl: coverPhotoUrl
            }
        })

        return res.json({
            message: "Book cover photo updated successfully!!!"
        })
    }catch(error){
        return res.status(500).json({
            message: "Internal server error!!!",
            error: error
        })
    }
})