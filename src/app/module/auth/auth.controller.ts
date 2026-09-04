import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { AuthService } from "./auth.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";

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

export const AuthController = {
    registerCitizen,
    registerEmailVerification
}