import keytar from 'keytar'
import { config } from './config.js'
import { PEEK_DIFF_PREFIX } from './consts.js'
import crypto from 'crypto'

export const getGitHubAuth = async (): Promise<string> => {
    const token = await keytar.getPassword(config.SERVICE_NAME, 'github')
    return token
}

const CYPHER_KEY = 'aes-128-cbc'

export const aesEncrypt = (text: string, key: string): string => {
    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipheriv(
        CYPHER_KEY,
        Buffer.from(key, 'hex'),
        iv
    )
    let encrypted = cipher.update(text, 'utf8', 'hex')
    encrypted += cipher.final('hex')

    return iv.toString('hex') + encrypted
}

export const aesDecrypt = (encrypted: string, key: string): string => {
    console.log(encrypted, key)
    const iv = Buffer.from(encrypted.slice(0, 32), 'hex')
    const data = encrypted.slice(32)
    const decipher = crypto.createDecipheriv(
        CYPHER_KEY,
        Buffer.from(key, 'hex'),
        iv
    )
    let decrypted = decipher.update(data, 'hex', 'utf8')
    decrypted += decipher.final('utf8')

    return decrypted
}

const peekAdditionPrefix = '+' + PEEK_DIFF_PREFIX

export const generateKey = (): string => {
    return crypto.randomBytes(16).toString('hex')
}

export const obfuscateFileContent = (
    content: string,
    key: string,
    entropy: number = 0
): string => {
    const lines = content.split('\n')
    const encryptedLines = lines.map((line, index) => {
        if (index % entropy != 0) return line
        return peekAdditionPrefix + aesEncrypt(line, key)
    })
    return encryptedLines.join('\n')
}

export const deobfuscateFileContent = (
    content: string,
    key: string
): string => {
    const lines = content.split('\n')
    const decryptedLines = lines.map((line) => {
        if (line.startsWith(peekAdditionPrefix)) {
            return aesDecrypt(line.replace(peekAdditionPrefix, ''), key)
        }
        return line
    })
    return decryptedLines.join('\n')
}

// TODO: move
export const invalidOrigin = (origin: string): boolean => {
    return origin.split('/').length != 2
}
