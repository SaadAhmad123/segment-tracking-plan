import { DynamoDB } from "aws-sdk";
import { RequestHandler } from "express";
import BranchManager from "../../management/BranchManager";
import { attachCorsHeaders, throwErrorOnEmpty } from "../../utils";

export default (dynamoDb: DynamoDB.DocumentClient): RequestHandler => async (req, res) => {
    attachCorsHeaders(res)
    try {
        const cognito_uuid = throwErrorOnEmpty(
            // @ts-ignore
            req?.requestContext?.authorizer?.claims?.sub,
            "Internal server error. Something is wrong with Authentication"
        )
        const branch_id = throwErrorOnEmpty(req?.params?.branch_id, "parameter 'branch_id' is required")
        const branchManager = new BranchManager(dynamoDb)
        const branch = await branchManager.get(branch_id).catch(e => {
            console.error(e)
            throw new Error("Internal server error... while getting branch")
        })
        if (!branch)
            throw new Error(`branch ${branch_id} does not exist`)
        await branchManager.delete(branch_id).catch(e => {
            console.error(e)
            throw new Error("Internal server error... while deleting branch")
        })
        res.status(200).json(branch)
        return
    }
    catch (e) {
        console.error(e)
        res.status(500).json({
            error: (e as Error).message
        })
    }
}