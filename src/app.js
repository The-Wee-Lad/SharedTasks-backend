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



export { app };