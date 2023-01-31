import axios, { Axios, AxiosError } from 'axios';
import { expect } from 'chai';
import login from '../../login';

describe('Branch', () => {
    let idToken: string;
    let axiosInstance: Axios;
    let branch_id: string

    before(async () => {
        // Log into AWS Cognito
        idToken = (await login()) || "";
        axiosInstance = axios.create({
            baseURL: process.env.API_BASE_URL,
            headers: {
                'Authorization': idToken
            }
        })
    });

    it("should have an IdToken", async () => {
        expect(idToken).to.not.equal(undefined)
    })

    it('should return a 500 on internal server error', async () => {
        // Send a POST request with invalid data to cause an internal server error

        const response = await axiosInstance.
            post('/repository/branch', {})
            .catch((e: AxiosError) => e.response);

        //console.log(response)

        expect(response?.status).to.equal(500);
        expect(response?.data).to.have.property('error');
        return
    });

    it('should return a 200 and create a branch for a repository', async () => {
        const repositoryId = Date.now().toString();
        const name = 'new-branch';
        const headCommitId = Date.now().toString();

        // Send POST request to create a branch
        const body = {
            repository_id: repositoryId,
            name,
            head_commit_id: headCommitId
        }
        const response = await axiosInstance
            .post('/repository/branch', body)
            .catch((e: AxiosError) => e.response);

        expect(response?.status).to.equal(201);
        expect(response?.data).to.have.property('uuid');
        branch_id = response?.data?.uuid
        expect(response?.data).to.have.property('name', name);
        expect(response?.data).to.have.property('created_at');
        expect(response?.data).to.have.property('repository_id', repositoryId);
        expect(response?.data).to.have.property('author_id');
        expect(response?.data).to.have.property('head_commit_id', headCommitId);
        return
    });

    it("should return a 200 with branch on get", async () => {
        const response = await axiosInstance
            .get(`/repository/branch/${branch_id}`)
            .catch((e: AxiosError) => e.response);

        expect(response?.status).to.equal(200);
        expect(response?.data).to.have.property('uuid');
        branch_id = response?.data?.uuid
        expect(response?.data).to.have.property('name');
        expect(response?.data).to.have.property('created_at');
        expect(response?.data).to.have.property('repository_id');
        expect(response?.data).to.have.property('author_id');
        expect(response?.data).to.have.property('head_commit_id');
        return
    })

    it('should update a branch for a repository', async () => {
        const updatedHeadCommitId = `ghi-${Date.now()}`
        const updateBody = {
            branch_id,
            name: 'updated-branch',
            head_commit_id: updatedHeadCommitId
        };

        const response = await axiosInstance.patch('/repository/branch', updateBody).catch((e: AxiosError) => e.response);

        expect(response?.status).to.equal(200);
        expect(response?.data).to.have.property('name', 'updated-branch');
        expect(response?.data).to.have.property('head_commit_id', updatedHeadCommitId);
    })

    it("should return a 200 with branch on delete", async () => {
        const response = await axiosInstance
            .delete(`/repository/branch/${branch_id}`)
            .catch((e: AxiosError) => e.response);

        expect(response?.status).to.equal(200);
        expect(response?.data).to.have.property('uuid');
        branch_id = response?.data?.uuid
        expect(response?.data).to.have.property('name');
        expect(response?.data).to.have.property('created_at');
        expect(response?.data).to.have.property('repository_id');
        expect(response?.data).to.have.property('author_id');
        expect(response?.data).to.have.property('head_commit_id');
        return
    })

    it("should return a 500 when trying to get the deleted branch", async () => {
        const response = await axiosInstance
            .get(`/repository/branch/${branch_id}`)
            .catch((e: AxiosError) => e.response);

        expect(response?.status).to.equal(500);
        expect(response?.data).to.have.property('error');
        return
    })


});

describe("For random repository_id create multiple branches and access them with pagination token", async () => {
    let idToken: string;
    let axiosInstance: Axios;
    let repository_id = Date.now().toString()
    let branch_names = [] as Array<string>
    let branch_ids = [] as Array<string>

    for (let i = 0; i < 20; i++) {
        branch_names.push(Date.now().toString() + "-" + i)
    }

    before(async () => {
        // Log into AWS Cognito
        idToken = (await login()) || "";
        axiosInstance = axios.create({
            baseURL: process.env.API_BASE_URL,
            headers: {
                'Authorization': idToken
            }
        })
    });

    it("should create the branches for the repository", async () => {
        for (const id of branch_names) {
            const params = {
                repository_id: repository_id,
                name: id
            }
            const response = await axiosInstance
                .post("/repository/branch", params)
                .catch((e: AxiosError) => e?.response)
            expect(response?.status).to.equal(201);
            expect(response?.data).to.have.property('uuid');
            branch_ids.push(response?.data?.uuid)
            expect(response?.data).to.have.property('name');
            expect(response?.data).to.have.property('created_at');
            expect(response?.data).to.have.property('repository_id');
            expect(response?.data).to.have.property('author_id');
        }
    })

    it("should fetch 5 branches of the repository then use pagination to fetch the next 5", async () => {
        let response = await axiosInstance
            .get(`/repository/${repository_id}/branch?limit=5`)
            .catch((e: AxiosError) => e?.response)

        expect(response?.status).to.equal(200);
        expect(response?.data).to.have.property('items');
        expect(response?.data).to.have.property('pagination');
        expect(response?.data?.pagination).to.have.property("count");
        expect(response?.data?.pagination).to.have.property("token");

        response = await axiosInstance
            .get(`/repository/${repository_id}/branch?limit=5&next=${response?.data?.pagination?.token}`)
            .catch((e: AxiosError) => e?.response)

        expect(response?.status).to.equal(200);
        expect(response?.data).to.have.property('items');
        return
    })

    it("should delete all the branches", async () => {
        for (const id of branch_ids) {
            const response = await axiosInstance
                .delete(`/repository/branch/${id}`)
                .catch((e: AxiosError) => e?.response)
            expect(response?.status).to.equal(200);
            expect(response?.data).to.have.property('uuid');
            expect(response?.data).to.have.property('name');
            expect(response?.data).to.have.property('created_at');
            expect(response?.data).to.have.property('repository_id');
            expect(response?.data).to.have.property('author_id');
        }
        return
    })
})

