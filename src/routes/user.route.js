import { Router } from "express";
import {
    register,
    login,
    refreshAccessToken,
    logout,
    updateFullname,
    changePassword,
    forgotPassword,
    updateEmail,
    getCurrentUser,
    confirmEmail,
    resendConfirmationEmail,
} from "../controllers/user.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
const router = Router();

router.route('/register').post(register);
router.route('/login').post(login);
router.route('/refresh').post(refreshAccessToken);   
router.route('/confirm/:confirmationToken').get(confirmEmail);
router.use(verifyJwt)
router.route('/logout').post(logout);
router.route('/update-fullname').patch(updateFullname);
router.route('/update-email').patch(updateEmail);
router.route('/change-password').patch(changePassword);
router.route('/forgot-password').patch(forgotPassword);
router.route('/current').get(getCurrentUser);
router.route('/resend-confirmation').post(resendConfirmationEmail);

export { router as userRouter }; 