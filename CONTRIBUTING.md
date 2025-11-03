# Contributing to Simple Icons

Thank you for your interest in contributing to Simple Icons! This document provides a quick overview. For detailed development information, see the [full Contributing Guide](docs/contributing.md).

## Quick Start

```bash
# Clone into your test vault's plugin folder
cd /path/to/vault/.obsidian/plugins
git clone https://github.com/iamJpRowan/obsidian-simple-icons.git
cd obsidian-simple-icons

# Install dependencies
npm install

# Start development mode (auto-rebuild)
npm run dev

# Enable plugin in Obsidian and reload (Ctrl/Cmd + R) after changes
```

## Ways to Contribute

### 1. Report Bugs

Found a bug? [Open an issue](https://github.com/iamJpRowan/obsidian-simple-icons/issues/new) with:
- Clear description
- Steps to reproduce
- Expected vs actual behavior
- Environment details (Obsidian version, OS, plugin version)
- Console errors (if any)

### 2. Suggest Features

Have an idea? [Open a discussion](https://github.com/iamJpRowan/obsidian-simple-icons/discussions/new) with:
- Use case description
- How it would work
- Why it would be useful

### 3. Improve Documentation

Documentation improvements are always welcome:
- Fix typos or unclear explanations
- Add examples
- Improve guides
- Translate documentation

### 4. Submit Code

**Before starting:**
1. Check [existing issues](https://github.com/iamJpRowan/obsidian-simple-icons/issues) and [discussions](https://github.com/iamJpRowan/obsidian-simple-icons/discussions)
2. For large changes, open a discussion first
3. For small fixes, go ahead and submit a PR

**Process:**
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes
4. Test thoroughly (see [Testing Guide](docs/testing.md))
5. Update documentation if needed
6. Commit with clear messages
7. Submit a pull request

## Development Guidelines

### Code Style

- **TypeScript** for all code
- **Tabs** for indentation (follow Obsidian convention)
- **Clear naming**: PascalCase for classes, camelCase for methods/variables
- **Type safety**: Avoid `any` types
- **Documentation**: JSDoc comments for complex functions

### Testing

Before submitting:
- [ ] Test all affected features
- [ ] Verify no console errors
- [ ] Test with different vault sizes
- [ ] Check settings still work
- [ ] Update documentation

See [Testing Guide](docs/testing.md) for detailed checklist.

### Commit Messages

Use clear, descriptive commit messages:

```
Good:
- Add folder icon support to file explorer
- Fix icon not updating when tag changes
- Improve performance with icon caching

Bad:
- Fixed bug
- Update code
- Changes
```

## Project Structure

```
obsidian-simple-icons/
├── src/                    # Source code
│   ├── main.ts            # Plugin entry point
│   ├── types.ts           # TypeScript interfaces
│   ├── IconResolver.ts    # Icon resolution logic
│   ├── IconRenderer.ts    # Rendering coordination
│   └── renderers/         # Location-specific renderers
├── docs/                   # User & developer documentation
├── devlog/                 # Development log
├── README.md              # Main documentation
├── CHANGELOG.md           # Version history
└── package.json           # Dependencies
```

## Resources

### Documentation
- **[Full Contributing Guide](docs/contributing.md)** - Detailed development guide
- **[Testing Guide](docs/testing.md)** - How to test changes
- **[Development Log](devlog/)** - Architecture decisions

### Getting Help
- **Questions**: [GitHub Discussions](https://github.com/iamJpRowan/obsidian-simple-icons/discussions)
- **Issues**: [GitHub Issues](https://github.com/iamJpRowan/obsidian-simple-icons/issues)
- **Documentation**: [docs/](docs/)

## Code of Conduct

- Be respectful and constructive
- Welcome newcomers
- Focus on what's best for the community
- Show empathy toward others

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing!** 🎉

For detailed information, see the [full Contributing Guide](docs/contributing.md).

