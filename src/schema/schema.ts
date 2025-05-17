import z from "zod";

export const userSchema = z.object({
    name: z.string().min(2),
    username: z.string().min(5),
    password: z.string().min(7)
})

export const userLogin = z.object({
    username: z.string().min(5),
    password: z.string().min(7)
})

export const adminSchema = z.object({
    name: z.string().min(2),
    username: z.string(),
    password: z.string().min(7)
})

export const adminLogin = z.object({
    username: z.string().min(5),
    password: z.string().min(7)
})

export const BookSchema = z.object({
    name: z.string().min(1),
    authorName: z.string().min(2)
})

export const EditBookSchema = z.object({
    name: z.string().min(1).optional(),
    authorName: z.string().min(1).optional()
})