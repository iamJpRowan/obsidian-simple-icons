# Setup Guide

Quick guide to set up the development environment with all automation tools.

## First-Time Setup

### 1. Install Dependencies

```bash
npm install
```

This will:
- Install all npm packages
- Set up Husky pre-commit hooks automatically
- Configure lint-staged

### 2. Configure Development Environment

Copy the example environment file and configure your vault path:

```bash
cp .env.example .env
```

Then edit `.env` and set your vault path:

```bash
VAULT_PATH=/path/to/your/test-vault
```

Replace `/path/to/your/test-vault` with the actual path to your Obsidian test vault.

The build script will automatically output to `{VAULT_PATH}/.obsidian/plugins/simple-icons`.

### 3. Verify Setup

Run these commands to ensure everything is working:

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Formatting check
npm run format:check

# Build
npm run build
```

All commands should complete without errors.

## Development Workflow

### Daily Development

```bash
# Start development mode (auto-rebuild on changes)
npm run dev

# In another terminal, make changes
vim src/IconResolver.ts

# Commit (pre-commit hooks run automatically)
git add .
git commit -m "feat: add new feature"

# Push (CI runs automatically on GitHub)
git push
```

### Code Quality

The following run automatically on commit, but you can also run manually:

```bash
# Fix linting issues
npm run lint:fix

# Format all code
npm run format

# Check TypeScript types
npm run type-check
```

### Creating a Release

```bash
# 1. Update version in package.json
vim package.json  # Change version to x.x.x

# 2. Sync all version files
npm run version

# 3. Commit and create tag
git commit -am "chore: bump version to x.x.x"
git tag vx.x.x

# 4. Push (triggers automated release)
git push && git push --tags
```

GitHub Actions will automatically:
- Build the plugin
- Generate changelog from commits
- Create a GitHub release
- Upload plugin files

## Troubleshooting

### Husky hooks not running

If pre-commit hooks aren't working:

```bash
# Reinstall Husky
rm -rf .husky
npm run prepare
```

### Build fails with "VAULT_PATH not set"

Make sure you have a `.env` file with `VAULT_PATH` set:

```bash
echo "VAULT_PATH=/path/to/vault" > .env
```

### Pre-commit hook is slow

The hook only checks staged files, so it should be fast (<2 seconds).

If it's slow:
- Check if you're staging large files
- Run `npm run lint:fix` manually first
- Use `git commit --no-verify` for emergencies (sparingly)

### CI failing on GitHub

Check the Actions tab on GitHub to see detailed logs:
1. Go to your repo on GitHub
2. Click "Actions" tab
3. Click on the failing workflow
4. Review the error messages

Common issues:
- Linting errors (run `npm run lint:fix` locally)
- Type errors (run `npm run type-check` locally)
- Format issues (run `npm run format` locally)

## VS Code Integration

If you're using VS Code:

1. Install recommended extensions when prompted (ESLint, Prettier)
2. Format on save is enabled automatically
3. ESLint auto-fixes on save

To manually install extensions:
```bash
code --install-extension dbaeumer.vscode-eslint
code --install-extension esbenp.prettier-vscode
```

## What Got Set Up

This setup includes:

- ✅ **Prettier** - Automatic code formatting
- ✅ **ESLint** - Code quality and style checking
- ✅ **Husky** - Git hooks management
- ✅ **lint-staged** - Run checks on staged files only
- ✅ **GitHub Actions CI** - Automated testing on PRs
- ✅ **GitHub Actions Release** - Automated releases
- ✅ **VS Code integration** - Editor settings and extensions

## Next Steps

- Read [GETTING-STARTED-DEV.md](GETTING-STARTED-DEV.md) for detailed development guide
- Read [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines
- Check [devlog/2024-11-03-dev-automation-setup.md](devlog/2024-11-03-dev-automation-setup.md) for implementation details

---

**Questions?** Open an issue or check the documentation in `docs/`.

