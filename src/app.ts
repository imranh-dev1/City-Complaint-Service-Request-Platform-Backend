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


// app.get("/test", async (req: Request, res: Response, next: NextFunction) => {
//     try {
//         const grantIdTokenResult = await getBkashIdToken();

//         console.log(grantIdTokenResult);

//         res.status(httpStatus.OK).json({
//             success: true,
//             message: "Welcome to Civic Connect Backend",
//             data: null,
//         });
//     } catch (error) {
//         console.log(error);
//         next(error);
//     }
// });

app.get("/", async (req: Request, res: Response) => {
    res.status(httpStatus.OK).json({
        success: true,
        message: "Welcome to Civic Connect Backend",
    });
});

// app.use(globalErrorHandler);
// app.use(notFound);

export default app;
