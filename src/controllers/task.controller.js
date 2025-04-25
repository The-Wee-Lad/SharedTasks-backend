import { Task } from "../models/task.model";
import { User } from "../models/user.model.js";
import { TodoList } from "../models/todolist.model.js";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Collaborator } from "../models/collaborators.model.js";
import { Assignment } from "../models/assignment.model.js";

//TODO: ADD Discussions like issues in github.

const createTask = asyncHandler(async (req, res) => {
    const { taskListId } = req.params;
    const { title, description, status, priority, dueDate } = req.body;
    const collaborater = Collaborator.findOne({ taskListId: taskListId, userId: req.user._id });
    const taskList = await TodoList.findById(taskListId);
    if (!taskList) {
        throw new ApiError(404, "Task List not found");
    }
    if ((!collaborater || collaborater.role == "view")
        && (taskList.createdBy.toString() != req.user._id.toString())) {
        throw new ApiError(403, "Not Authorized to create task in this task list");
    }
    const task = await Task.create({
        title,
        description,
        status: status || "todo",
        priority: priority || "low",
        dueDate: dueDate ? new Date(dueDate) : null,
        taskListId: taskListId,
    });
    res.status(201).json(new ApiResponse(201, task, "Task Created"));
    console.log("Task created : ", task);
});

const deleteTask = asyncHandler(async (req, res) => {
    const { taskId } = req.params;
    const task = await Task.findBy(taskId);
    if (!task) {
        throw new ApiError(404, "Task not found");
    }
    const taskList = await TodoList.findById(task?.taskListId);
    if (!taskList) {
        throw new ApiError(404, "Task List not found");
    }
    const collaborater = Collaborator.findOne({ taskListId: taskList._id, userId: req.user._id });
    if ((!collaborater || collaborater.role == "view")
        && (taskList.createdBy.toString() != req.user._id.toString())) {
        throw new ApiError(403, "Not Authorized to delete task in this task list");
    }
    await Assignment.deleteMany({ taskId: taskId });
    await Task.findByIdAndDelete(taskId);
    res.status(200).json(new ApiResponse(200, null, "Task Deleted"));
    console.log("Task deleted : ", task);
});

const getTask = asyncHandler(async (req, res) => {
    const { taskId } = req.params;
    const task = await Task.findById(taskId);
    if (!task) {
        throw new ApiError(404, "Task not found");
    }
    const taskList = await TodoList.findById(task?.taskListId);
    if (!taskList) {
        throw new ApiError(404, "Task List not found");
    }
    const collaborater = Collaborator.findOne(
        { taskListId: taskList._id, userId: req.user._id }
    );
    if ((!collaborater)
        && (taskList.createdBy.toString() != req.user._id.toString())
        && (taskList?.public == false)) {
        throw new ApiError(403, "Not Authorized to get task in this task list");
    }
    res.status(200).json(new ApiResponse(200, task, "Task Found"));
});

const updateTask = asyncHandler(async (req, res) => {
    const { taskId } = req.params;
    const { title, description, status, priority, dueDate } = req.body;
    const task = await Task.findById(taskId);
    if (!task) {
        throw new ApiError(404, "Task not found");
    }
    const taskList = await TodoList.findById(task?.taskListId);
    if (!taskList) {
        throw new ApiError(404, "Task List not found");
    }
    const collaborater = await Collaborator.findOne(
        { taskListId: taskList._id, userId: req.user._id },
    );
    if(!collaborater || collaborater.role == "view"
        && (taskList.createdBy.toString() != req.user._id.toString())
        && (taskList?.public == false)
        && (taskList?.public == true && taskList?.role == "view")){ 
        throw new ApiError(403, "Not Authorized to update task in this task list");
    }
    // const assignment = await Assignment.findOne({ taskId: taskId, userId: req.user._id });
    // if (!assignment && (!collaborater || collaborater.role != "admin")) {
    //     throw new ApiError(403, "Not Authorized to update task in this task list");
    // }
    task.title = title || task.title;
    task.description = description || task.description;
    task.status = status || task.status;
    task.priority = priority || task.priority;
    task.dueDate = dueDate ? new Date(dueDate) : task.dueDate;
    await task.save();
    res.status(200).json(new ApiResponse(200, task, "Task Updated"));
    console.log("Task updated : ", task);
});

export {
    createTask,
    deleteTask,
    updateTask,
    getTask,
}