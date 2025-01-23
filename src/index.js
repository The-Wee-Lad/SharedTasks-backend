import dotenv from "dotenv";
import { connectDb } from "./db/index.js";
import { app } from "./app.js"

dotenv.config({
    path: "./.env"
})

const port = process.env.PORT||3000

connectDb()
.then((res) => {
    app.listen(port, () => {
        console.log(`App listening at ${port}\nhttp://localhost:${port}`);
    });
    app.on("error", (error) => {
        console.log(`App failed Due to an Error ${error}`)
    });
})
.catch((err) => {
    console.error("express instance failed to initiate : ",err)
})
