import { AuthProvider, Role, UserStatus } from "../../../generated/prisma/enums";

export interface IUserRegisterPayload {
    name: string;
    email: string;
    password?: string;
    googleId?: string;
    authProvider?: AuthProvider;
    emailVerified?: boolean;
    role?: Role;
    status?: UserStatus;
    needPasswordChange?: boolean;
    imageUrl?: string;
    imagePublicId?: string;
    phone?: string | null;
    isDeleted?: boolean;
    deletedAt?: Date | null;
}
