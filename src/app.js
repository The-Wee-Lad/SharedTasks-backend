import express from "express"
import cookieParser from "cookie-parser";
import cors from "cors"


const app = express();

const corsOptions = {
    origin : "*",
    optionsSuccessStatus: 200,
    credentials: true
}

app.use(cors(corsOptions))
app.use(express.urlencoded({extended:true},{limit:"16kb"}));
app.use(express.json({limit:"16kb"}));
app.use(cookieParser());
app.use(express.static('./public'));

import { taskRouter } from './routes/task.route.js'
import { tasklistRouter } from "./routes/tasklist.route.js";
import { userRouter } from "./routes/user.route.js"
import { healthcheckController } from "./controllers/healthcheck.controller.js";
import { managementRouter } from "./routes/management.route.js";
app.use('/api/v1/user',userRouter);
app.use('/api/v1/task',taskRouter);
app.use('/api/v1/tasklist',tasklistRouter);
app.use('/api/v1/healthcheck',healthcheckController);
app.use('/api/v1/management',managementRouter);

app.use((req, res) => {
    res.status(404).json({status:404,message:"Route not found!!!",req:req.originalUrl});
});


export { app };