#!/usr/bin/env npx ts-node --esm

import chalk from 'chalk'
import figlet from 'figlet'
import { program } from 'commander'
import keytar from 'keytar'
import { config } from './config.js'
import {
    deobfuscateFileContent,
    generateKey,
    getGitHubAuth,
    obfuscateFileContent
} from './utils.js'
import { err, success, warn } from './cli.js'
import { LocalGitClient } from './clients/LocalGitClient.js'
import { ERR, PEEK_BRANCH_PREFIX } from './consts.js'
import { GitHubClient } from './clients/GitHubClient.js'
import { info } from 'console'

const { SERVICE_NAME } = config

program.addHelpText(
    'before',
    chalk.yellowBright(figlet.textSync('peek', { horizontalLayout: 'full' }))
)

program
    .version('0.0.1')
    .description(chalk.blueBright(`keep your PRs private with peek`))

program
    .command('set-gh-token <token>')
    .description(
        'Login with an authentication token. Visit https://github.com/settings/tokens to generate a token.'
    )
    .action(async (token) => {
        await keytar.setPassword(SERVICE_NAME, 'github', token)
        success('GitHub token set successfully!')
    })

program
    .command('get-gh-token')
    .description('Get GitHub authentication token')
    .action(async () => {
        const token = await keytar.getPassword(SERVICE_NAME, 'github')
        info(`GitHub token: ${token}`)
    })

program
    .command('del-gh-token')
    .description('Delete GitHub authentication token')
    .action(async () => {
        await keytar.deletePassword(SERVICE_NAME, 'github')
        success('GitHub token deleted successfully!')
    })

// we are assuming that the user has already committed their changes locally
program
    .command('create')
    .description("Checkout a new obfuscated 'peek' branch")
    .option(
        '-e --entropy',
        'The entropy of the encryption. The higher the entropy, the more secure the encryption. The lower the entropy, the more readable the diff.',
        '10'
    )
    .option('-k --key', 'Provided a secret key', generateKey())
    .action(async (options) => {
        const { entropy, key } = options

        const currentBranch = LocalGitClient.getCurrentBranch()
        if (currentBranch.split('/')[0] == PEEK_BRANCH_PREFIX)
            err("You're already in a peek branch.")

        // checkout new branch
        try {
            await LocalGitClient.checkoutBranch(
                `${PEEK_BRANCH_PREFIX}/${currentBranch}`
            )
        } catch (error) {
            err(error.message)
        }

        // obfuscate files
        try {
            let files = await LocalGitClient.getChangedFiles()
            files.forEach((file) => {
                let content = LocalGitClient.getFileContent(file)
                let obfuscatedContent = obfuscateFileContent(
                    content,
                    key,
                    entropy
                )
                LocalGitClient.writeChanges(file, obfuscatedContent)
            })
        } catch (error) {
            err(error.message)
        }

        // commit changes locally
        try {
            await LocalGitClient.commitChanges('Obfuscated changes')
        } catch (error) {
            err(error.message)
        }

        success(
            `Peek created with entropy ${entropy} and key ${key} \n To push your peek to GitHub, run: peek push`
        )
    })

program
    .command('quit')
    .description('Pause/abort your peek')
    .option('-a --abort', 'Abort your peek', false)
    .action(async (options) => {
        const { abort } = options
        const currentBranch = LocalGitClient.getCurrentBranch()
        if (currentBranch.split('/')[0] != PEEK_BRANCH_PREFIX)
            err('You must be on a peek branch to quit.')

        // TODO: switch back to base branch
        warn('not implemented yet')
    })

program
    .command('resume')
    .description('Resume your peek in progress')
    .action(async () => {
        const currentBranch = LocalGitClient.getCurrentBranch()
        if (currentBranch.split('/')[0] == PEEK_BRANCH_PREFIX)
            err("You're already in a peek branch.")

        // TODO: switch back to peek branch
        warn('not implemented yet')
    })

program
    .command('push')
    .description('Push your peek to GitHub')
    .action(async () => {
        const currentBranch = LocalGitClient.getCurrentBranch()
        if (currentBranch.split('/')[0] != PEEK_BRANCH_PREFIX)
            err('You must be on a peek branch to push.')

        const token = await getGitHubAuth()
        if (!token) err(ERR.NO_GH_TOKEN)

        const origin = LocalGitClient.getOrigin()

        try {
            await LocalGitClient.squashCommits()
            await LocalGitClient.push(currentBranch)
            const gh = new GitHubClient(origin, token)
            await gh.createPR('peek', 'Created by peek', currentBranch)
        } catch (error) {
            err(error.message)
        }

        // TODO: print PR link
        success(`PR created successfully!`)
    })

// TODO: should this function exit the peek branch?
program
    .command('reveal <key>')
    .description('Reveal your peek on GitHub')
    .action(async (key) => {
        const currentBranch = LocalGitClient.getCurrentBranch()
        if (currentBranch.split('/')[0] != PEEK_BRANCH_PREFIX)
            err('You must be on a peek branch to reveal.')

        if (!key) err('You must provide a key to reveal your peek.')

        const token = await getGitHubAuth()
        if (!token) err(ERR.NO_GH_TOKEN)

        // deobfuscate files
        try {
            let files = await LocalGitClient.getChangedFiles()
            files.forEach((file) => {
                let content = LocalGitClient.getFileContent(file)
                let obfuscatedContent = deobfuscateFileContent(content, key)
                LocalGitClient.writeChanges(file, obfuscatedContent)
            })
        } catch (error) {
            err(error.message)
        }

        // commit changes locally
        try {
            await LocalGitClient.commitChanges('Deobfuscated changes')
        } catch (error) {
            err(error.message)
        }

        // squash commits
        try {
            await LocalGitClient.squashCommits()
        } catch (error) {
            err(error.message)
        }

        // push changes to GitHub
        try {
            await LocalGitClient.push(currentBranch)
        } catch (error) {
            err(error.message)
        }

        success(`Peek revealed successfully!`)
    })

program.parse(process.argv)
