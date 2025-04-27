import mongoose from "mongoose";
import { TaskList } from "../models/tasklist.model.js";
import { Collaborator } from "../models/collaborators.model.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Task } from "../models/task.model.js";

const createTasklist = asyncHandler(async (req, res) => {
    const { title, description, dueDate, isPublic, role } = req.body;
    const userId = req.user._id;
    const tasklist = await TaskList.create({
        title,
        description,
        createdBy: userId,
        dueDate: dueDate ? new Date(dueDate) : null,
        public: {
            isPublic: isPublic || false,
            role: isPublic ? role : null,
        },
    });
    console.log("TaskList Created : ", tasklist._id);

    try {
        const collaborator = await Collaborator.create({
            userId: userId,
            taskListId: tasklist._id,
            role: "admin",
        });
    } catch (error) {
        console.error("Error creating collaborator: ", error);
        await tasklist.remove();
        throw new ApiError(500, {}, "Failed to create collaborator for tasklist.");
    }
    res.status(201).json(new ApiResponse(201, tasklist, "Tasklist created successfully"));
    console.log("TaskList Created : ", tasklist);
});

const getTasklistById = asyncHandler(async (req, res) => {
    const tasklistId = req.params.tasklistId;
    const tasklist = await TaskList.findById(tasklistId);
    if (!tasklist) {
        throw new ApiError(404, {}, "Tasklist not found");
    }
    const collaborator = await Collaborator.findOne({
        taskListId: tasklistId,
        userId: req?.user?._id,
    });

    console.log("Collaborator : ", collaborator);
    

    if (tasklist?.public?.isPublic === false && (!collaborator) && tasklist?.createdBy.toString() !== req?.user?._id.toString()) {
        throw new ApiError(403, "You are not authorized to access this tasklist");
    }

    const entireTasklist = await TaskList.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(tasklistId),
            },
        },
        {
            $lookup: {
                from: "tasks",
                localField: "_id",
                foreignField: "taskListId",
                as: "tasks",
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "createdBy",
                foreignField: "_id",
                as: "createdBy",
                pipeline: [
                    {
                        $project: {
                            _id: 1,
                            fullname: 1,
                            username: 1,
                            email: 1
                        }
                    }
                ]
            },
        },
        {
            $unwind: "$createdBy",
        },
        {
            $addFields: {
                "role": collaborator?.role || "view",
            }
        }
    ]);

    res.status(200).json(new ApiResponse(200, entireTasklist, "Tasklist retrieved successfully"));
    console.log("TaskList Retrieved : ", entireTasklist);
});

const getAllMyTasklist = asyncHandler(async (req, res) => {

    const allMyTasklist = await TaskList.aggregate([
        {
            $lookup: {
                from: "collaborators",
                localField: "_id",
                foreignField: "taskListId",
                as: "collaborators",
            }
        },
        {
            $match: {
                $or: [
                    { createdBy: new mongoose.Types.ObjectId(req?.user?._id) },
                    { "collaborators.userId": new mongoose.Types.ObjectId(req?.user?._id) }
                ]
            }
        },
        {
            $addFields: {
                "role": {
                    $arrayElemAt: [
                        {
                            $filter: {
                                input: "$collaborators",
                                as: "collaborator",
                                cond: { $eq: ["$$collaborator.userId", new mongoose.Types.ObjectId(req?.user?._id)] }
                            }
                        }, 0
                    ]
                }
            }
        },
        {
            $addFields: {
                "role": { $ifNull: ["$role.role", "view"] }
            }
        }
    ]);


    if (allMyTasklist?.length === 0) {
        res.status(200).json(new ApiResponse(200, [], "No Tasklists found"));
    }

    res.status(200).json(new ApiResponse(200, allMyTasklist, "All Tasklists retrieved successfully"));
    console.log("All TaskList Retrieved : ", allMyTasklist);
});

const deleteTasklistById = asyncHandler(async (req, res) => {
    const tasklistId = req.params.tasklistId;
    const collaborator = await Collaborator.findOne({
        taskListId: tasklistId,
        userId: req?.user?._id,
    });
    const tasklist = await TaskList.findById(tasklistId);
    if (!tasklist) {
        throw new ApiError(404, {}, "Tasklist not found");
    }
    if ((!collaborator || collaborator?.role != "admin") && tasklist?.createdBy.toString() !== req?.user?._id.toString()) {
        throw new ApiError(403, {}, "You are not authorized to delete this tasklist");
    }
    await Collaborator.deleteMany({ taskListId: tasklistId });
    await Task.deleteMany({ taskListId: tasklistId });
    await TaskList.findByIdAndDelete(tasklistId);
    res.status(200).json(new ApiResponse(200, tasklist, "Tasklist deleted successfully"));
    console.log("TaskList Deleted : ", tasklist);
});

const updateTasklistById = asyncHandler(async (req, res) => {
    const tasklistId = req.params.tasklistId;
    console.log(req?.user?._id  );
    
    const collaborator = await Collaborator.findOne({
        taskListId: tasklistId,
        userId: req?.user?._id,
    });
    const tasklist = await TaskList.findById(tasklistId);
    if (!tasklist) {
        throw new ApiError(404, {}, "Tasklist not found");
    }

    console.log("Collaborator : ", collaborator); 
    

    if ((tasklist?.public?.isPublic === false) && (tasklist?.public?.role == "view" ||  tasklist?.public?.role == "")
        && tasklist?.createdBy.toString() !== req?.user?._id.toString()
        && collaborator?.role == "view") {
        throw new ApiError(403, {}, "You are not authorized to access this tasklist");
    }
    const { title, description, dueDate, isArchived, isPublic, role, isCompleted } = req.body;
    tasklist.title = title || tasklist.title;
    tasklist.description = description || tasklist.description;
    tasklist.dueDate = dueDate ? new Date(dueDate) : tasklist.dueDate;
    tasklist.public.isPublic = isPublic || tasklist.public.isPublic;
    tasklist.public.role = role || tasklist.public.role;
    tasklist.isCompleted = isCompleted || tasklist.isCompleted;
    tasklist.isArchived = isArchived || tasklist.isArchived;
    await tasklist.save();
    res.status(200).json(new ApiResponse(200, tasklist, "Tasklist updated successfully"));
    console.log("TaskList Updated : ", tasklist);
});

export {
    createTasklist,
    getTasklistById,
    getAllMyTasklist,
    deleteTasklistById,
    updateTasklistById,
}