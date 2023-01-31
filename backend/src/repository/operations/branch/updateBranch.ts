import { DynamoDB } from "aws-sdk";
import { RequestHandler } from "express";
import BranchManager from "../../management/BranchManager";
import { attachCorsHeaders, throwErrorOnEmpty } from "../../utils";
import { RequestWithBody } from './types'

type UpdateBranchType = {
    branch_id: string
    name?: string,
    head_commit_id?: string
}

export default (dynamoDb: DynamoDB.DocumentClient): RequestHandler => async (req: RequestWithBody<UpdateBranchType>, res) => {
    attachCorsHeaders(res)
    try {
        const cognito_uuid = throwErrorOnEmpty(
            // @ts-ignore
            req?.requestContext?.authorizer?.claims?.sub,
            "Internal server error. Something is wrong with Authentication"
        )
        const branch_id = throwErrorOnEmpty(req?.body?.branch_id, "Feild 'branch_id' is required")
        const name = req?.body?.name
        const head_commit_id = req?.body?.head_commit_id

        const branchManager = new BranchManager(dynamoDb)
        let branch = await branchManager.get(branch_id).catch(e => {
            console.error(e)
            throw new Error("Error occured while checking if the branch exists")
        })

        if (!branch)
            throw new Error(`The branch '${branch_id}' does not exist`)

        branch = await branchManager.update(branch_id, {
            name,
            head_commit_id,
        }).catch(e => {
            console.error(e)
            throw new Error("Error occured while updating the branch")
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