import bcrypt from "bcryptjs";
import httpStatus from "http-status";
import { prisma } from "../lib/prisma";
import { AppError } from "./AppError";
import { Role, TechAvailability } from "../../generated/prisma/enums";
import config from "../config";

// 1. Seed Super Admin
export const seedSuperAdmin = async () => {
    try {
        const isSuperAdminExist = await prisma.user.findFirst({
            where: {
                role: Role.SUPER_ADMIN,
            },
        });

        if (isSuperAdminExist) {
            console.log("Super Admin Already Exists!");
            return;
        }

        const name = config.super_admin_name;
        const email = config.super_admin_email;
        const password = config.super_admin_password;

        if (!name || !email || !password) {
            throw new AppError(
                httpStatus.INTERNAL_SERVER_ERROR,
                "Super Admin Name , Email, Password Missing In Env File!!!",
            );
        }

        const hashedPassword = await bcrypt.hash(
            password,
            Number(config.bcrypt_salt_rounds),
        );

        const superAdmin = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: Role.SUPER_ADMIN,
                needPasswordChange: false,
                emailVerified: true,
            },
        });

        console.log("Super Admin Created : ", superAdmin);
    } catch (error) {
        console.log("Error Seeding Super Admin : ", error);
    }
};

// 2. Seed Tester Admin
export const seedTesterAdmin = async () => {
    try {
        const isTesterAdminExist = await prisma.user.findFirst({
            where: {
                email: config.tester_admin_email,
            },
        });

        if (isTesterAdminExist) {
            console.log("Tester Admin Already Exists!");
            return;
        }

        const name = config.tester_admin_name;
        const email = config.tester_admin_email;
        const password = config.tester_admin_password;

        if (!name || !email || !password) {
            throw new AppError(
                httpStatus.INTERNAL_SERVER_ERROR,
                "Tester Admin Name , Email, Password Missing In Env File!!!",
            );
        }

        const hashedPassword = await bcrypt.hash(
            password,
            Number(config.bcrypt_salt_rounds),
        );

        const testerAdmin = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: Role.ADMIN,
                needPasswordChange: false,
                emailVerified: true,
            },
        });

        console.log("Tester Admin Created : ", testerAdmin);
    } catch (error) {
        console.log("Error Seeding Tester Admin : ", error);
    }
};

export const seedTesterCitizen = async () => {
    try {
        const isTesterCitizenExist = await prisma.user.findFirst({
            where: {
                email: config.tester_citizen_email,
            },
        });

        if (isTesterCitizenExist) {
            console.log("Tester Citizen Already Exists!");
            return;
        }

        const name = config.tester_citizen_name;
        const email = config.tester_citizen_email;
        const password = config.tester_citizen_password;

        if (!name || !email || !password) {
            throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, "Tester Citizen Name , Email, Password Missing In Env File!!!",);
        }

        const hashedPassword = await bcrypt.hash(
            password,
            Number(config.bcrypt_salt_rounds),
        );

        const testerCitizen = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: Role.CITIZEN,
                needPasswordChange: false,
                emailVerified: true,
            },
        });

        console.log("Tester Citizen Created : ", testerCitizen);
    } catch (error) {

        console.log("Error Seeding Tester Citizen : ", error);
    }
};

// 4. Seed Tester Technician (নতুন যুক্ত করা হলো এবং এর প্রোফাইল রিলেশন তৈরি করা হয়েছে)
export const seedTesterTechnician = async () => {
    try {
        const isTesterTechnicianExist = await prisma.user.findFirst({
            where: {
                email: config.tester_technician_email,
            },
        });

        if (isTesterTechnicianExist) {
            console.log("Tester Technician Already Exists!");
            return;
        }

        const name = config.tester_technician_name;
        const email = config.tester_technician_email;
        const password = config.tester_technician_password;

        if (!name || !email || !password) {
            throw new AppError(
                httpStatus.INTERNAL_SERVER_ERROR,
                "Tester Technician Name , Email, Password Missing In Env File!!!",
            );
        }

        const hashedPassword = await bcrypt.hash(password, Number(config.bcrypt_salt_rounds),);

        const testerTechnician = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: Role.TECHNICIAN,
                needPasswordChange: false,
                emailVerified: true,
                technician: {
                    create: {
                        specialization: "Electrical",
                        experience: 5,
                        bio: "Expert urban service electrician specialized in city infrastructures.",
                        rating: 4.5,
                        totalJobs: 12,
                        availability: TechAvailability.AVAILABLE,
                        isVerified: true,
                        serviceRadius: 15,
                        hourlyRate: 25.0,
                    },
                },
            },
        });

        console.log("Tester Technician Created : ", testerTechnician);
    } catch (error) {
        console.log("Error Seeding Tester Technician : ", error);
    }
};
