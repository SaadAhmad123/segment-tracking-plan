import { RequestHandler, Request } from "express";

export interface RequestWithBody<T extends Record<string, any>> extends Request {
    body: T
}
