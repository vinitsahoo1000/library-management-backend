import express from "express";
import { mainRouter } from "./routes";
import cors from "cors";

export const app = express();

const PORT = 3000;

app.use(express.json());
app.use(cors());
app.use('/api/v1',mainRouter);


app.get('/health',async(req,res)=>{
    res.send({
        msg: "Server is healthy!!"
    })
})

app.listen(PORT, ()=>{
    console.log(`server is running on ${PORT}`)
})
