import axios, { Axios, AxiosError } from 'axios';
import { expect } from 'chai';
import login from '../../login';

describe('/repository/branch', () => {
    let idToken: string;
    let axiosInstance: Axios;

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
        const response = await axios
            .post('/repository/branch', body, {
                baseURL: process.env.API_BASE_URL,
                headers: {
                    'Authorization': idToken
                }
            })
            .catch((e: AxiosError) => e.response);

        expect(response?.status).to.equal(201);
        expect(response?.data).to.have.property('uuid');
        expect(response?.data).to.have.property('name', name);
        expect(response?.data).to.have.property('created_at');
        expect(response?.data).to.have.property('repository_id', repositoryId);
        expect(response?.data).to.have.property('author_id');
        expect(response?.data).to.have.property('head_commit_id', headCommitId);
        return
    });

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
});
