import { Router } from "express"; 
import { AuthController } from "./auth.controller";
import { validateRequest } from "../../middleware/validateRequest";
import { UserValidations } from "./auth.validation";

const router = Router();

router.post("/register", validateRequest(UserValidations.createUserValidationSchema), AuthController.registerPatient)


export const AuthRoutes = router;