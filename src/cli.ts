import chalk from 'chalk'

export const Alert = {
    success: (message: string): void => {
        console.log(chalk.green(message))
    },
    error: (message: string): void => {
        console.log(chalk.red(message))
    },
    info: (message: string): void => {
        console.log(chalk.blue(message))
    },
    warn: (message: string): void => {
        console.log(chalk.yellow(message))
    }
}

export const success = (message: string): void => {
    Alert.success(message)
    process.exit(1)
}

export const err = (message: string): void => {
    Alert.error(message)
    process.exit(1)
}

export const info = (message: string): void => {
    Alert.info(message)
    process.exit(1)
}

export const warn = (message: string): void => {
    Alert.warn(message)
    process.exit(1)
}
