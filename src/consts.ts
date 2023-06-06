export enum ERR {
    NO_GH_TOKEN = `
        You must be logged in to GitHub to use this command.
        Visit https://github.com/settings/tokens to generate a token and run 'set-gh-token <token>' to set it.
    `
}

export const DEFAULT_BODY = 'Body'
export const DEFAULT_TITLE = 'Title'
export const DEFAULT_MESSAGE = 'Message'

export const PEEK_BRANCH_PREFIX = 'peek'
export const PEEK_DIFF_PREFIX = '!!!'
