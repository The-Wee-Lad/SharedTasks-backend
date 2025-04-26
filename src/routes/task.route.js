import { Router } from "express";
import {
    createTask,
    deleteTask,
    updateTask,
    getTask,
} from "../controllers/task.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { tasklistAuthMiddleware } from "../middlewares/tasklistAuth.middleware.js";

const router = Router();
router.route("/update/:taskId").put(tasklistAuthMiddleware, updateTask);
router.route("/get/:taskId").get(tasklistAuthMiddleware, getTask);
router.route("/create/:taskListId").post(verifyJwt, createTask);
router.route("/delete/:taskId").delete(verifyJwt, deleteTask);

export { router as taskRouter }; 