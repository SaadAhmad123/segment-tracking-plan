import { Response } from "express";

export const attachCorsHeaders = (res: Response) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
};

export const throwErrorOnEmpty = (value: any, error = "Value is empty") => {
    if (
        value === undefined ||
        value === null
    ) throw new Error(error)
    return value;
}