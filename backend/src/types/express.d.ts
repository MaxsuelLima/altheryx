import { PrismaClient } from "@prisma/client";

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        userName: string;
        workspaceId: string;
        workspaceSlug: string;
        role: string;
        isAdmin: boolean;
        isMaster: boolean;
      };
      workspaceId?: string;
    }
  }
}
