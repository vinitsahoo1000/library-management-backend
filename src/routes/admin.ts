import express,{Request,Response} from "express";
import { adminLogin, BookSchema, userSchema } from "../schema/schema";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { authMiddleware } from "../middleware/middleware";
import cloudinary from "../config/config";
import multer from "multer";

export const adminRouter = express.Router();

const prisma = new PrismaClient();
const jwt_secret = process.env.JWT_SECRET;
const upload = multer({dest:"uploads/"});

adminRouter.post('/signup',async(req:Request,res:Response):Promise<any>=>{
    try{
        const signupBody = userSchema.parse(req.body);
        
        const isUser = await prisma.admin.findFirst({
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

        const newUser = await prisma.admin.create({
            data:{
                name: signupBody.name,
                username: signupBody.username,
                password: hashedPassword
            }
        })

        const token = jwt.sign({
                id: newUser.id, username: newUser.username,type:"admin"},
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
    
            const token = jwt.sign({userId:user.id,email:user.username,type:"admin"},jwt_secret!)
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

adminRouter.get('/verify',authMiddleware,async(req:Request,res:Response):Promise<any>=>{
    try{
        const username = req.username;
        const userId = req.id;
        const token_type = req.type;    

        if(token_type!="admin"){
            return res.status(498).json({
                error: "Your are not a admin!!!!"
            })
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
        const token_type = req.type;    

        if(token_type!="admin"){
            return res.status(498).json({
                error: "Your are not a admin!!!!"
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

        const newBook = await prisma.book.create({
            data:{
                name: bookPayload.name,
                authorName: bookPayload.authorName,
                adminId: adminId!,
                imageUrl: coverPhotoUrl
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

