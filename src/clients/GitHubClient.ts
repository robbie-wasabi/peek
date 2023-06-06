import { Octokit } from '@octokit/rest'
import { invalidOrigin } from '../utils.js'

export class GitHubClient {
    private octokit: Octokit
    private origin: string

    private owner(): string {
        console.log(this.origin)
        return this.origin.split('/')[0]
    }

    private repository(): string {
        return this.origin.split('/')[1]
    }

    constructor(origin: string, token: string) {
        if (invalidOrigin(origin)) throw new Error('Invalid origin.')
        this.origin = origin
        this.octokit = new Octokit({ auth: token })
    }

    private async getDefaultBranch(): Promise<string> {
        const {
            data: { default_branch }
        } = await this.octokit.repos.get({
            owner: this.owner(),
            repo: this.repository()
        })
        return default_branch
    }

    public async createPR(
        title: string,
        body: string,
        branch: string,
        draft: boolean = true
    ): Promise<any> {
        const defaultBranch = await this.getDefaultBranch()
        return this.octokit.pulls.create({
            owner: this.owner(),
            repo: this.repository(),
            title,
            head: branch,
            base: defaultBranch,
            body,
            draft
        })
    }
}
