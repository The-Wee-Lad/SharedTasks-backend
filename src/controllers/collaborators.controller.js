import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Collaborator } from "../models/collaborators.model.js";


const updateCollaborator = asyncHandler(async (req, res) => {
    const { role, taskListId, target } = req.body;
    const userId = req.user._id;
    const userCollab = await Collaborator.findOne({ userId, tasklistId: taskListId });
    if (!userCollab || userCollab.role !== "admin") {
        throw new ApiError(403, "You are not authorized to update this collaborator");
    }
    const collaborator = await Collaborator.findOneAndUpdate(
        { userId: target, tasklistId: taskListId },
        { role },
        { new: true }
    );
    if (!collaborator) {
        throw new ApiError(404, "Collaborator not found");
    };
    res.status(200).json(new ApiResponse(200, collaborator, "Collaborator updated successfully"));
    console.log("Collaborator updated successfully", collaborator);
});

const deleteCollaborator = asyncHandler(async (req, res) => {
    const { collaboratorId, taskListId, target } = req.body;
    const userId = req.user._id;
    const userCollab = await Collaborator.findOne({
        userId, tasklistId: taskListId
    });
    if (!userCollab || userCollab.role !== "admin") {
        throw new ApiError(403, "You are not authorized to delete this collaborator");
    }
    const collaborator = await Collaborator.findOneAndDelete({ userId: target, tasklistId: taskListId });
    if (!collaborator) {
        throw new ApiError(404, "Collaborator not found");
    };
    res.status(200).json(new ApiResponse(200, collaborator, "Collaborator deleted successfully"));
});

const getCollaborators = asyncHandler(async (req, res) => {
    const { taskListId } = req.body;
    const userId = req.user._id;
    const userCollab = await Collaborator.findOne({ userId, tasklistId: taskListId });
    if(!userCollab) {
        throw new ApiError(403, "You are not authorized to view this collaborator");
    }
    const collaborators = await Collaborator.find({ taskListId });
    if (!collaborators) {
        throw new ApiError(404, "Collaborators not found");
    };
    res.status(200).json(new ApiResponse(200, collaborators, "Collaborators retrieved successfully"));
    console.log("Collaborators retrieved successfully", collaborators);
});

export {
    updateCollaborator,
    deleteCollaborator,
    getCollaborators,
}