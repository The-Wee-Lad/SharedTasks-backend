import { Router } from "express";
import {
    createTasklist,
    getTasklistById,
    getAllMyTasklist,
    deleteTasklistById,
    updateTasklistById,
} from "../controllers/tasklist.controller.js";
import { tasklistAuthMiddleware } from "../middlewares/tasklistAuth.middleware.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = Router();
router.route("/").post((req, res) => {
    res.status(200).json({ message: "Tasklist route" });
    console.log("Tasklist route accessed");
});
router.route("/create").post(verifyJwt, createTasklist);
router.route("/get/:tasklistId").get(tasklistAuthMiddleware, getTasklistById);
router.route("/get").get(verifyJwt, getAllMyTasklist);
router.route("/delete/:tasklistId").delete(verifyJwt, deleteTasklistById);
router.route("/update/:tasklistId").patch(tasklistAuthMiddleware, updateTasklistById);

export { router as tasklistRouter };