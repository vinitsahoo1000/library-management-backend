import { Request, Response, NextFunction } from "express";
declare global {
    namespace Express {
        interface Request {
            id?: number;
            username?: string;
            type?: string;
        }
    }
}
export declare const authMiddleware: (req: Request, res: Response, next: NextFunction) => void;
