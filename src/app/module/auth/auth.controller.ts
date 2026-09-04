import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { AuthService } from "./auth.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";
import { AppError } from "../../utils/AppError";
import { IRequestUser } from "./auth.interface";

const registerCitizen = catchAsync(async (req: Request, res: Response) => {

    const payload = req.body;

    await AuthService.registerUser(payload);

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "Verification OTP Sent",
        data: null,
    });
});

const registerEmailVerification = catchAsync(async (req: Request, res: Response) => {
    const payload = req.body;
    const result = await AuthService.registerCitizenVerification(payload);

    const { accessToken, refreshToken, user, citizen } = result;

    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: false,
        sameSite: "none",
        maxAge: 1000 * 60 * 60 * 24, // 24 hour or 1 day
    });

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: "none",
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    });

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "Citizen Email verification Successfully & Citizen registered successfully",
        data: {
            accessToken,
            refreshToken,
            user,
            citizen,
        },
    });

});

const loginUser = catchAsync(async (req: Request, res: Response) => {
    const payload = req.body;
    const result = await AuthService.loginUser(payload);
    const { accessToken, refreshToken } = result;

    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: false,
        sameSite: "none",
        maxAge: 1000 * 60 * 60 * 24, // 24 hour or 1 day
    });
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: "none",
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    });

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "User logged in successfully",
        data: {
            accessToken,
            refreshToken,
        },
    });
});

const getMe = catchAsync(async (req: Request, res: Response) => {
    const user = req.user as unknown as IRequestUser;

    if (!user) {
        throw new AppError(400, "User information is missing in the request");
    }

    const result = await AuthService.getMe(user);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "User profile fetched successfully",
        data: result,
    });
});

const googleLogin = catchAsync(async (req: Request, res: Response) => {
    const result = await AuthService.googleLogin(req.body);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "User logged in successfully",
        data: result,
    });
});

const refreshToken = catchAsync(async (req: Request, res: Response) => {
    if (!req.cookies.refreshToken) {
        throw new AppError(401, "Refresh token is missing");
    }
    const result = await AuthService.refreshToken(req.cookies.refreshToken);
    const { accessToken, refreshToken: newRefreshToken } = result;

    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: false,
        sameSite: "none",
        maxAge: 1000 * 60 * 60 * 24, // 24 hour or 1 day
    });
    res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: "none",
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    });

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "New tokens generated successfully",
        data: {
            accessToken,
            refreshToken: newRefreshToken,
        },
    });
});

const forgotPassword = catchAsync(async (req: Request, res: Response) => {
    const payload = req.body;

    await AuthService.forgotPassword(payload)

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: `User Password Forgot successfully, This email, ${payload.email}`,
        data: null,
    });
});

const resetPassword = catchAsync(async (req: Request, res: Response) => {
    const payload = req.body;

    await AuthService.resetPassword(payload)

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "User Password reset successfully..",
        data: null,
    });
});

export const AuthController = {
    registerCitizen,
    registerEmailVerification,
    loginUser,
    getMe,
    googleLogin,
    refreshToken,
    forgotPassword,
    resetPassword
}  