import crypto from "crypto";
import bcrypt from "bcryptjs";
import httpStatus from "http-status";
import { IEmailVerifyPayload, ILoginUserPayload, IUserRegisterPayload } from "./auth.interface";
import { AppError } from "../../utils/AppError";
import config from "../../config";
import { prisma } from "../../lib/prisma";
import { redisClient } from "../../lib/redis";
import sendEmail from "../../utils/sendEmail";
import { Role, UserStatus } from "../../../generated/prisma/enums";
import { jwtUtils } from "../../utils/jwt";
import { SignOptions } from "jsonwebtoken";

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

const registerCitizenVerification = async (payload: IEmailVerifyPayload) => {
    const email = payload.email.trim().toLowerCase();
    const otp = payload.otp;

    const isUserExists = await prisma.user.findUnique({
        where: { email },
    });

    if (isUserExists) {
        throw new AppError(httpStatus.CONFLICT, "User with this email already exists.");
    }

    const otpKey = `citizen-registration-otp:${email}`;

    const storedOtp = await redisClient.get(otpKey);

    if (!storedOtp) {
        throw new AppError(httpStatus.BAD_REQUEST, "OTP has expired. Please register again.");
    }

    if (storedOtp !== otp) {
        throw new AppError(httpStatus.BAD_REQUEST, "Invalid OTP.");
    }

    const citizenRegistrationKey = `citizen-registration-data:${email}`;

    const storedUserData = await redisClient.get(citizenRegistrationKey);

    if (!storedUserData) {
        throw new AppError(httpStatus.BAD_REQUEST, "Registration data has expired. Please register again.");
    }

    const redisUserDataPayload = JSON.parse(storedUserData);

    const citizenPayload: IUserRegisterPayload = redisUserDataPayload;

    const createdUser = await prisma.user.create({
        data: {
            name: citizenPayload.name,
            email: citizenPayload.email,
            password: citizenPayload.password,
            role: Role.CITIZEN,
            status: UserStatus.ACTIVE,
            emailVerified: true,
            citizen: {
                create: {
                    address: citizenPayload.citizen?.address,
                    wardNo: citizenPayload.citizen?.wardNo,
                    area: citizenPayload.citizen?.area,
                },
            },
        },

        omit: {
            password: true,
        },

        include: {
            citizen: true,
        },
    });

    await redisClient.del([
        otpKey,
        citizenRegistrationKey,
    ]);

    await sendEmail({
        to: citizenPayload.email,
        subject: "Welcome to //#endregion City Complaint & Service Request Platform",
        template: "registration-success",
        data: {
            name: citizenPayload.name,
            email: citizenPayload.email,
        },
    });

    const { citizen: createdCitizen, ...user } = createdUser;

    const jwtPayload = {
        userId: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
    };

    const accessToken = jwtUtils.createToken(
        jwtPayload,
        config.jwt_access_secret,
        config.jwt_access_expires_in as SignOptions,
    );

    const refreshToken = jwtUtils.createToken(
        jwtPayload,
        config.jwt_refresh_secret,
        config.jwt_refresh_expires_in as SignOptions,
    );

    return {
        user,
        citizen: createdCitizen,
        accessToken,
        refreshToken,
    };
};

const loginUser = async (payload: ILoginUserPayload) => {
    const { password } = payload;
    const email = payload.email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user) {
        throw new AppError(404, "User not found");
    }

    if (user.status === UserStatus.BLOCKED) {
        throw new AppError(403, "User is blocked");
    }

    if (user.isDeleted || user.status === UserStatus.DELETED) {
        throw new AppError(404, "User is deleted");
    }

    if (user.password === null && user.googleId !== null) {
        throw new AppError(400, "User Already Has Account Registerd with Google, try to login with google.",);
    }

    const isPasswordMatched = await bcrypt.compare(password, user.password as string,);

    if (!isPasswordMatched) {
        throw new AppError(401, "Invalid credentials");
    }

    const jwtPayload = {
        userId: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
    };

    const accessToken = jwtUtils.createToken(
        jwtPayload,
        config.jwt_access_secret,
        config.jwt_access_expires_in as SignOptions,
    );

    const refreshToken = jwtUtils.createToken(
        jwtPayload,
        config.jwt_refresh_secret,
        config.jwt_refresh_expires_in as SignOptions,
    );

    return {
        accessToken,
        refreshToken,
    };
};

export const AuthService = {
    registerUser,
    registerCitizenVerification,
    loginUser
};
