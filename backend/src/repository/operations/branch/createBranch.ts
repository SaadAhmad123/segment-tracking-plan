import { DynamoDB } from "aws-sdk";
import { RequestHandler, Request } from "express";
import BranchManager from "../../management/BranchManager";
import { attachCorsHeaders, throwErrorOnEmpty } from "../../utils";
import { RequestWithBody } from "./types";

type CreateBranchType = {
    repository_id?: string
    name?: string,
    head_commit_id?: string
}

export default (dynamoDb: DynamoDB.DocumentClient): RequestHandler => async (req: RequestWithBody<CreateBranchType>, res) => {
    attachCorsHeaders(res)
    try {
        const cognito_uuid = throwErrorOnEmpty(
            // @ts-ignore
            req?.requestContext?.authorizer?.claims?.sub,
            "Internal server error. Something is wrong with Authentication"
        )
        const repository_id = throwErrorOnEmpty(req?.body?.repository_id, "Field 'repository_id' is required")
        const name = throwErrorOnEmpty(req?.body?.name, "Field 'name' is required")
        const head_commit_id = req?.body?.head_commit_id || ""
        const branchManager = new BranchManager(dynamoDb)
        const catchCallback = (src: string) => (e: Error) => {
            console.error(e)
            throw new Error("Internal server error. Creating branch..." + src)
        }

        const branch = await branchManager.getBranchByRepositoryIdAndName(
            repository_id,
            name
        ).catch(catchCallback("getBranchByRepositoryIdAndName"))

        if (branch)
            throw new Error(`A branch with name ${name} already exists`)

        const resp = await branchManager.create(
            repository_id,
            name,
            cognito_uuid,
            head_commit_id,
        ).catch(catchCallback("create"))

        res.status(201).json(resp)
        return
    }
    catch (e) {
        console.error(e)
        res.status(500).json({
            error: (e as Error).message
        })
    }
}