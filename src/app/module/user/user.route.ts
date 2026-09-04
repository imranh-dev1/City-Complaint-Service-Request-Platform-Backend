import { Router } from "express";
import { auth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";
import { upload } from "../../lib/multer";
import { UserController } from "./user.controller";

const router = Router();

router.patch("/profile-image-upload", auth(Role.SUPER_ADMIN, Role.ADMIN, Role.CITIZEN, Role.TECHNICIAN), upload.single("profile-image"), UserController.profileImageUpload)

export const UserRoutes = router;