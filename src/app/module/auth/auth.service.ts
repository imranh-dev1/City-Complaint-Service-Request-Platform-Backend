import crypto from "crypto";
import { Role } from "../../../generated/prisma/enums";
import bcrypt from "bcryptjs";
import httpStatus from "http-status";
import { IUserRegisterPayload } from "./auth.interface";
import { AppError } from "../../utils/AppError";
import config from "../../config";
import { prisma } from "../../lib/prisma";
import { redisClient } from "../../lib/redis";
import sendEmail from "../../utils/sendEmail";

const registerUser = async (payload: IUserRegisterPayload) => {
    const { name, email: rawEmail, password, phone } = payload;
    const email = rawEmail.trim().toLowerCase();

    if (!password) {
        throw new AppError(httpStatus.BAD_REQUEST, "Password is required");
    }

    const isUserExists = await prisma.user.findFirst({
        where: { email },
    });

    if (isUserExists) {
        throw new AppError(httpStatus.CONFLICT, "User with this email already exists");
    }

    const saltRounds = Number(config.bcrypt_salt_rounds);

    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const expirationSeconds = 10 * 60;
    const otpKey = `citizen-registration-otp:${email}`;
    const otpValue = crypto.randomInt(100000, 1000000).toString();

    await redisClient.set(otpKey, otpValue, {
        EX: expirationSeconds,
    });

    const citizenRegistrationKey = `citizen-registration-data:${email}`;
    const redisUserDataPayload = {
        name,
        email,
        password: hashedPassword,
        phone: phone,
        role: Role.CITIZEN,
    };

    await redisClient.set(
        citizenRegistrationKey,
        JSON.stringify(redisUserDataPayload), {
        EX: expirationSeconds,
    });

    await sendEmail({
        to: email,
        subject: "Verify Your City Complaint & Service Request Platform Email Address",
        template: "email-verification",
        data: {
            otp: otpValue,
            expirationMinutes: Math.ceil(expirationSeconds / 60),
        }
    });

    return {
        success: true,
        message: "Verification OTP sent to email successfully.",
    };
};

export const AuthService = {
    registerUser,
};
