import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Collaborator } from "../models/collaborators.model.js";
import { TaskList } from "../models/tasklist.model.js";
import { Invitation } from "../models/invitation.model.js";


const createInvitation = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { taskListId, invitee, role, comment} = req.body;
    if(!taskListId || !invitee || !role) {
        throw new ApiError(400, "taskListId, invitee and role are required");
    }
    const taskList = await TaskList.findById(taskListId);
    if (!taskList) {
        throw new ApiError(404, "Tasklist not found");
    }
    const collaborator = await Collaborator.findOne({ taskListId, userId});
    if(!collaborator || collaborator.role !== "admin"){
        throw new ApiError(403, "You are not authorized to invite users to this tasklist");
    }
    const existingInvitation = await Invitation.find({ taskListId, invitee });
    console.log(existingInvitation);
    if(existingInvitation.some(obj=> obj.status === "pending")) {
        throw new ApiError(409, "Invitation already exists for this user");
    }
    const invitation = await Invitation.create({
        taskListId,
        invitee,
        inviter: userId,
        role,
        comment: {
            request: comment
        }
    });
    res.status(201).json(new ApiResponse(201, invitation, "Invitation created successfully"));
    console.log("Invitation created successfully", invitation);
});

const acceptInvitation = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { invitationId, comment } = req.body;
    const invitation = await Invitation.findById(invitationId);
    if (!invitation) {
        throw new ApiError(404, "Invitation not found");
    }
    if(invitation.invitee.toString() !== userId.toString()) {
        throw new ApiError(403, "You are not authorized to accept this invitation");
    }
    if(invitation.status !== "pending") {
        throw new ApiError(409, "Invitation already accepted or rejected");
    }
    const taskList = await TaskList.findById(invitation.taskListId);
    if (!taskList) {
        throw new ApiError(404, "Tasklist not found");
    }
    const existingCollaborator = await Collaborator.findOne({ taskListId: invitation.taskListId, userId });
    if(existingCollaborator) {
        throw new ApiError(409, "You are already a collaborator on this tasklist");
    }
    const collaborator = await Collaborator.create({
        taskListId: invitation.taskListId,
        userId,
        role: invitation.role
    });
    invitation.status = "accepted";
    invitation.comment.response = comment;
    await invitation.save();
    res.status(200).json(new ApiResponse(200, collaborator, "Invitation accepted successfully"));
    console.log("Invitation accepted successfully", collaborator);
});

const rejectInvitation = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { invitationId, comment } = req.body;
    const invitation = await Invitation.findById(invitationId);
    if (!invitation) {
        throw new ApiError(404, "Invitation not found");
    }
    if(invitation.invitee.toString() !== userId.toString()) {
        throw new ApiError(403, "You are not authorized to reject this invitation");
    }
    if(invitation.status !== "pending") {
        throw new ApiError(409, "Invitation already accepted or rejected");
    }
    invitation.status = "rejected";
    invitation.comment.response = comment;
    await invitation.save();
    res.status(200).json(new ApiResponse(200, invitation, "Invitation rejected successfully"));
    console.log("Invitation rejected successfully", invitation);
});

const deleteInvitation = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { invitationId } = req.body;
    
    const invitation = await Invitation.findById(invitationId);
    if (!invitation) {
        throw new ApiError(404, "Invitation not found");
    }
    if(invitation.inviter.toString() !== userId.toString()) {
        throw new ApiError(403, "You are not authorized to delete this invitation");
    }
    if(invitation.status !== "pending") {
        throw new ApiError(409, "Invitation already accepted or rejected");
    }
    await Invitation.findByIdAndDelete(invitationId);
    res.status(200).json(new ApiResponse(200, null, "Invitation deleted successfully"));
    console.log("Invitation deleted successfully", invitationId);
});

const getAllMyInvitations = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    
    
    const invitations = await Invitation.find({
        invitee : userId
    });
    res.status(200).json(new ApiResponse(200, invitations, "All invitations fetched successfully"));
    console.log("All invitations fetched successfully", invitations);
});

const getInvitationById = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const invitationId = req.body.invitationId;
    console.log(invitationId);
    
    const invitation = await Invitation.findById(invitationId);
    if (!invitation) {
        throw new ApiError(404, "Invitation not found");
    }

    res.status(200).json(new ApiResponse(200, invitation, "Invitation fetched successfully"));
    console.log("Invitation fetched successfully", invitation);
});


export {
    createInvitation,
    acceptInvitation,
    rejectInvitation,
    deleteInvitation,
    getAllMyInvitations,
    getInvitationById,
}