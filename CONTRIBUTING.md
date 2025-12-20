# Contributing to Roles & Privileges Payload Plugin

Thank you for your interest in contributing! We use [semantic-release](https://semantic-release.gitbook.io/) for automated versioning and releases.

## Commit Message Convention

We follow the [Angular Commit Message Convention](https://github.com/angular/angular/blob/main/CONTRIBUTING.md#-commit-message-format). This allows us to automatically generate changelogs and determine version bumps.

### Commit Message Format

Each commit message consists of a **header**, a **body**, and a **footer**:

```
<type>(<scope>): <subject>
<BLANK LINE>
<body>
<BLANK LINE>
<footer>
```

The **header** is mandatory and must conform to the format `<type>(<scope>): <subject>`.

### Type

Must be one of the following:

- **feat**: A new feature (triggers MINOR version bump)
- **fix**: A bug fix (triggers PATCH version bump)
- **docs**: Documentation only changes
- **style**: Changes that do not affect the meaning of the code (white-space, formatting, etc)
- **refactor**: A code change that neither fixes a bug nor adds a feature
- **perf**: A code change that improves performance
- **test**: Adding missing tests or correcting existing tests
- **build**: Changes that affect the build system or external dependencies
- **ci**: Changes to our CI configuration files and scripts
- **chore**: Other changes that don't modify src or test files

### Scope

The scope should be the name of the affected area:

- `access`: Access control and privilege checking
- `collections`: Roles collection
- `globals`: Global privilege handling
- `ui`: Admin UI components
- `types`: TypeScript types
- `docs`: Documentation
- `config`: Plugin configuration

### Subject

The subject contains a succinct description of the change:

- use the imperative, present tense: "change" not "changed" nor "changes"
- don't capitalize the first letter
- no dot (.) at the end

### Examples

```
feat(collections): add ability to use custom roles collection

fix(access): correct privilege check for field-level access

docs(README): update installation instructions

chore(deps): update payload to v3.38.0
```

### Breaking Changes

Breaking changes should be indicated by adding `BREAKING CHANGE:` in the footer or by appending `!` after the type/scope:

```
feat(access)!: change hasPrivilege API signature

BREAKING CHANGE: hasPrivilege now requires a config object instead of positional arguments
```

This will trigger a MAJOR version bump.

## Development Setup

1. Fork and clone the repository
2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Make your changes

4. Build the project:

   ```bash
   pnpm run build
   ```

5. Run linting:
   ```bash
   pnpm run lint
   ```

## Pull Request Process

1. Create a branch from `main`
2. Make your changes following the commit convention
3. Push your branch and create a pull request
4. Ensure CI passes
5. Wait for review

## Release Process

Releases are fully automated using semantic-release:

1. When commits are pushed to `main`, semantic-release analyzes the commit messages
2. It determines the next version number based on the commits
3. It generates a changelog
4. It publishes the package to npm
5. It creates a GitHub release

You don't need to manually update version numbers or create releases!
