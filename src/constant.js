export const todoDB = "SharedTasks";
import dotenv from "dotenv";
dotenv.config({
    path: "./.env",
    credentials : true,
});
export const cookieOptions = {
    httpOnly : true,
    secure : process.env.NODE_ENV === "production",
};
