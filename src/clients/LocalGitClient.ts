import { execSync } from 'child_process'
import { writeFileSync, readFileSync } from 'fs'
import { simpleGit } from 'simple-git'

export class LocalGitClient {
    static git = simpleGit()

    static async getChangedFiles(): Promise<string[]> {
        const diffSummary = await this.git.diff(['--name-only', 'origin/main'])
        const files = diffSummary.split(' ').map((file) => file.trim())
        return files
    }

    static getFileContent(filePath: string): string {
        return readFileSync(filePath, 'utf8')
    }

    static writeChanges(filePath: string, changes: string): void {
        writeFileSync(filePath, changes)
    }

    static async commitChanges(message: string = 'Peek'): Promise<void> {
        await this.git.add('./*')
        await this.git.commit(message)
    }

    static getCurrentBranch(): string {
        return execSync('git rev-parse --abbrev-ref HEAD', {
            encoding: 'utf-8'
        }).trim()
    }

    static getOrigin(): string {
        const res = execSync('git remote get-url origin', {
            encoding: 'utf-8'
        })
        const segs = res.trim().split('/')
        return `${segs[3]}/${segs[4]}`.replace('.git', '')
    }

    static createBranch(dir: string, branch: string): string {
        return execSync(`git checkout -b ${dir}/${branch}`, {
            encoding: 'utf-8'
        })
    }

    static async checkoutBranch(branch: string) {
        return await this.git.checkoutLocalBranch(branch)
    }

    static async squashCommits(
        message: string = 'Squashed commit history'
    ): Promise<void> {
        // Get the hash of the initial commit (this will be the parent of all other commits)
        const log = await this.git.log({ '--reverse': null })
        const initialCommitHash: string = log.all[0].hash

        // Reset to the initial commit while keeping the changes in the working directory
        await this.git.reset([initialCommitHash, '--soft'])

        // Commit the changes, effectively squashing all previous commits into this one
        await this.git.commit(message)
    }

    static async push(branchName: string): Promise<void> {
        await this.git.push('origin', branchName, ['-f'])
    }
}

export default LocalGitClient
