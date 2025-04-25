import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { Collaborator } from "../models/Collaborator.js";
import { Task } from "../models/Task.js";
import { Tasklist } from "../models/Tasklist.js";
import { User } from "../models/User.js";


const assignTask = asyncHandler(async (req, res) => {
    const { taskId, target } = req.body;
    const userId = req.user._id;
    const task = await Task.findById(taskId);
    if (!task) {
        throw new ApiError(404, "Task not found");
    }
    const taskList = await Tasklist.findById(task.tasklistId);
    if (!taskList) {
        throw new ApiError(404, "Tasklist not found");
    }
    const userCollab = await Collaborator.findOne({ userId, tasklistId: taskList._id });
    if (!userCollab || userCollab.role !== "admin") {
        throw new ApiError(403, "You are not authorized to assign this task");
    }
    const collaborator = await Collaborator.findOne({ userId: target, tasklistId: taskList._id });
    if (!collaborator) {
        throw new ApiError(404, "Collaborator not found");
    }
    const assignedTask = await Task.findByIdAndUpdate(
        taskId,
        { assignedTo: target },
        { new: true }
    );
    res.status(200).json(new ApiResponse(200, assignedTask, "Task assigned successfully"));
    console.log("Task assigned successfully", assignedTask);
})

const unassignTask = asyncHandler(async (req, res) => {
    const { taskId, target } = req.body;
    const userId = req.user._id;
    const task = await Task.findById(taskId);
    if (!task) {
        throw new ApiError(404, "Task not found");
    }
    const taskList = await Tasklist.findById(task.tasklistId);
    if (!taskList) {
        throw new ApiError(404, "Tasklist not found");
    }
    const userCollab = await Collaborator.findOne({ userId, tasklistId: taskList._id });
    if (!userCollab || userCollab.role !== "admin") {
        throw new ApiError(403, "You are not authorized to assign this task");
    }
    const collaborator = await Collaborator.findOne({ userId: target, tasklistId: taskList._id });
    if (!collaborator) {
        throw new ApiError(404, "Collaborator not found");
    }
    const unassignedTask = await Task.findByIdAndDelete(taskId);

    res.status(200).json(new ApiResponse(200, unassignedTask, "Task assigned successfully"));
    console.log("Task assigned successfully", unassignedTask);
})

const getAllAssignments = asyncHandler(async (req, res) => {
    const { taskId } = req.body;
    const userId = req.user._id;
    const task = await Task.findById(taskId);
    if (!task) {
        throw new ApiError(404, "Task not found");
    }
    const collaborator = await Collaborator.findOne({ userId, tasklistId: task.tasklistId });
    if (!collaborator) {
        throw new ApiError(403, "You are not authorized to view this task");
    }
    const assignments = await Task.find({ taskId });
    if (!assignments) {
        throw new ApiError(404, "Assignments not found");
    }
    res.status(200).json(new ApiResponse(200, assignments, "Assignments retrieved successfully"));
    console.log("Assignments retrieved successfully", assignments);
});

export {
    assignTask,
    unassignTask,
    getAllAssignments,
}