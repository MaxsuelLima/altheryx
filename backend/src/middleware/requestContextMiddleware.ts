import { Request, Response, NextFunction } from "express";
import { requestContext } from "../lib/requestContext";

export function injectRequestContext(req: Request, _res: Response, next: NextFunction) {
  const forwarded = req.headers["x-forwarded-for"];
  let ip: string | undefined;
  if (forwarded) {
    ip = (Array.isArray(forwarded) ? forwarded[0] : forwarded).split(",")[0].trim();
  } else {
    ip = req.socket?.remoteAddress || undefined;
  }

  const ctx = {
    usuario: req.user?.userName || "sistema",
    ip,
    workspaceId: req.workspaceId || req.user?.workspaceId || undefined,
  };

  requestContext.run(ctx, next);
}
