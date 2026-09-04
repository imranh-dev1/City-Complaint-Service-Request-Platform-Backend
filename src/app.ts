import cookieParser from "cookie-parser";
import cors from "cors";
import express, {
    type Application,
    type NextFunction,
    type Request,
    type Response,
} from "express";
import httpStatus from "http-status";
import config from "./app/config";
import { globalErrorHandler } from "./app/middleware/globalErrorHandler";
import { notFound } from "./app/middleware/notFound";
import { AuthRoutes } from "./app/module/auth/auth.router";
import { UserRoutes } from "./app/module/user/user.route";


const app: Application = express();

app.use(
    cors({
        origin: config.frontend_url,
        credentials: true,
    }),
);

app.use(express.urlencoded({ extended: true }));

app.use(express.json());
app.use(cookieParser());


app.get("/", async (req: Request, res: Response) => {
    res.status(httpStatus.OK).json({
        success: true,
        message: "Welcome to Civic Connect Backend",
    });
});

app.use("/api/v1/auth", AuthRoutes);
app.use("/api/v1/users", UserRoutes);

app.use(globalErrorHandler);
app.use(notFound);

export default app;
