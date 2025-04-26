import { Router } from "express";
import {
    createTasklist,
    getTasklistById,
    getAllMyTasklist,
    deleteTasklistById,
    updateTasklistById,
} from "../controllers/tasklist.controller.js";
import { tasklistAuthMiddleware } from "../middlewares/tasklistAuth.middleware.js";

const router = Router();

router.route("/create").post(tasklistAuthMiddleware, createTasklist);
router.route("/get/:tasklistId").get(tasklistAuthMiddleware, getTasklistById);
router.route("/get").get(tasklistAuthMiddleware, getAllMyTasklist);
router.route("/delete/:tasklistId").delete(tasklistAuthMiddleware, deleteTasklistById);
router.route("/update/:tasklistId").patch(tasklistAuthMiddleware, updateTasklistById);

export { router as tasklistRouter };