import { AsyncLocalStorage } from "async_hooks";

export interface RequestContext {
  usuario: string;
  ip?: string;
  workspaceId?: string;
}

export const requestContext = new AsyncLocalStorage<RequestContext>();
