import { UserRole } from "@prisma/client";
import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: UserRole;
      businessName: string;
      emailVerified: boolean;
      phoneVerified: boolean;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
    businessName: string;
    emailVerified: boolean;
    phoneVerified: boolean;
  }
}
