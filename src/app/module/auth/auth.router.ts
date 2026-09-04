import { Router } from "express";
import { AuthController } from "./auth.controller";
import { validateRequest } from "../../middleware/validateRequest";
import { UserValidations } from "./auth.validation";
import { auth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

router.post("/register", validateRequest(UserValidations.createUserValidationSchema), AuthController.registerCitizen);

router.post("/register-email-verify", validateRequest(UserValidations.verifyEmailValidationSchema), AuthController.registerEmailVerification);

router.post("/login", validateRequest(UserValidations.loginValidationSchema), AuthController.loginUser);

router.get("/me", auth(Role.ADMIN, Role.CITIZEN, Role.SUPER_ADMIN, Role.TECHNICIAN), AuthController.getMe);

router.post("/google", AuthController.googleLogin);

router.post("/refresh-token", AuthController.refreshToken);

router.post("/forgot-password", validateRequest(UserValidations.forgotPasswordZodSchema), AuthController.forgotPassword);

router.post("/reset-password", validateRequest(UserValidations.resetPasswordZodSchema), AuthController.resetPassword);

router.post("/logout", auth(Role.ADMIN, Role.CITIZEN, Role.SUPER_ADMIN, Role.TECHNICIAN), AuthController.logoutUser);

export const AuthRoutes = router;