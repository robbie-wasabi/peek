# Peek CLI

The Peek CLI is a command-line tool that allows developers to create 'previews' of their changes in an obfuscated form. Once some condition is met, the developer can 'reveal' the changes, de-obfuscating the code for final integration. 

## Installation

You can install the CLI by cloning this repository:

```bash
$ git clone https://github.com/rrossilli/peek-cli.git
$ cd peek-cli
$ npm install
$ npm link
```

## Usage

Before using the Peek CLI, you will need to set your GitHub token. Visit [https://github.com/settings/tokens](https://github.com/settings/tokens) to generate a token. Once you have your token, you can set it with the following command:

```bash
$ peek set-gh-token <token>
```

To view your currently set GitHub token, use the following command:

```bash
$ peek get-gh-token
```

If you need to delete your stored GitHub token, use:

```bash
$ peek del-gh-token
```

### Creating a Peek

Assuming you've made changes and committed them locally, you can create a Peek branch with obfuscated changes using the `create` command:

```bash
$ peek create
```

Options for this command include `-e` or `--entropy` to set the entropy of the encryption, and `-k` or `--key` to provide a secret key for encryption. 

### Pushing a Peek

Once you've created a Peek, you can push it to GitHub with the `push` command:

```bash
$ peek push
```

This command squashes your commits and pushes them to the remote repository, creating a Pull Request with obfuscated changes.

### Revealing a Peek

To de-obfuscate your changes and reveal the actual code, use the `reveal` command:

```bash
$ peek reveal <key>
```

This command needs the encryption key that was used to create the Peek. The key de-obfuscates the code, squashes the commits and pushes the changes to the remote repository.

## Note

Remember to always be in the root of your local git repository when running the Peek commands.

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.