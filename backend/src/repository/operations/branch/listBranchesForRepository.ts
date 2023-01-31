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
        const repository_id = throwErrorOnEmpty(
            req?.params?.repository_id,
            "Parameter 'repository_id' is required"
        )
        const limit = parseInt((req?.query?.limit as string) || "10")
        const next = req?.query?.next as string | undefined

        const branchManager = new BranchManager(dynamoDb)
        const resp = await branchManager.listBranchesForRepository(
            repository_id,
            limit,
            next
        )
        res.status(200).json(resp)
        return
    }
    catch (e) {
        console.error(e)
        res.status(500).json({
            error: (e as Error).message
        })
    }
}