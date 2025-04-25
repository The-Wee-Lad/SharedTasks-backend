import { Router } from "express";
import {
    createInvitation,
    acceptInvitation,
    rejectInvitation,
    deleteInvitation,
    getAllMyInvitations,
    getInvitationById,
} from "../controllers/invitation.controller.js";
import {
    updateCollaborator,
    deleteCollaborator,
    getCollaborators,
} from "../controllers/collaborators.controller.js";
import {
    assignTask,
    unassignTask,
    getAllAssignments,
} from "../controllers/assignment.controller.js";
import { verifyJwt } from "../middlewares/verifyJwt.js";
import { tasklistAuthMiddleware } from "../middlewares/tasklistAuth.middleware.js";


const router = Router();

router.route("/invite/create").post(verifyJwt, createInvitation);
router.route("/invite/accept").post(verifyJwt, acceptInvitation);
router.route("/invite/reject").post(verifyJwt, rejectInvitation);
router.route("/invite/delete/:invitationId").delete(verifyJwt, deleteInvitation);
router.route("/invite/get-all").get(verifyJwt, getAllMyInvitations);
router.route("/invite/get").get(verifyJwt, getInvitationById);

router.route("/collab/update").put(verifyJwt, updateCollaborator);
router.route("/collab/delete").delete(verifyJwt, deleteCollaborator);
router.route("/collab/get").get(verifyJwt, getCollaborators);

router.route("/assignment/assign").post(verifyJwt, assignTask);
router.route("/assignment/unassign").post(verifyJwt, unassignTask);
router.route("/assignment/get").get(verifyJwt, getAllAssignments);

export { router as managementRouter };