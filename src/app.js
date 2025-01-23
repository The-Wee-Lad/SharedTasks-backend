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
app.use(express.json({limit:"16kb"}));
app.use(express.urlencoded({limit:"16kb"}));
app.use(cookieParser());
app.use(express.static('./public'));

import { requestRouter } from "./routes/request.route.js";
import { taskRouter } from './routes/task.route.js'
import { todolistRouter } from "./routes/todolist.route.js";
import { userRouter } from "./routes/user.route.js"
app.use('/api/v1/user',userRouter);
app.use('/api/v1/task',taskRouter);
app.use('/api/v1/todolist',todolistRouter);
app.use('/api/v1/request',requestRouter);



export { app };