# Documentation Structure

Guide to all documentation available for Simple Icons plugin.

## For Users

Start here if you're using the plugin.

### Getting Started

- **[README.md](README.md)** - ⭐ Start here! Feature overview and quick installation
- **[Quick Start Guide](docs/quickstart.md)** - Get up and running in 5 minutes
- **[Icon Reference](docs/icon-reference.md)** - Complete guide to using icons

### Troubleshooting

- **[Troubleshooting Guide](docs/troubleshooting.md)** - Common issues and solutions
- **[GitHub Issues](https://github.com/iamJpRowan/obsidian-simple-icons/issues)** - Report bugs
- **[GitHub Discussions](https://github.com/iamJpRowan/obsidian-simple-icons/discussions)** - Ask questions

## For Developers

Start here if you're contributing or customizing the plugin.

### Getting Started

- **[Quick Dev Start Guide](GETTING-STARTED-DEV.md)** - ⭐ Start here for development
- **[Contributing Guide](CONTRIBUTING.md)** - How to contribute to the project
- **[Testing Guide](docs/testing.md)** - How to test your changes

### Understanding the Code

- **[Development Log](devlog/)** - Design decisions and implementation history
  - [Initial Architecture](devlog/2024-11-03-initial-architecture.md) - Plugin foundation
  - [Renderer System](devlog/2024-11-03-renderer-system.md) - Multi-location rendering
  - [Icon Resolution](devlog/2024-11-03-icon-resolution.md) - Priority system
  - [Performance Optimization](devlog/2024-11-03-performance-optimization.md) - Caching and observers
  - [Dev Automation Setup](devlog/2024-11-03-dev-automation-setup.md) - CI/CD and tooling

### Project History

- **[CHANGELOG.md](CHANGELOG.md)** - Version history and release notes

## Documentation Organization

### `/docs` - Detailed Documentation

User and developer guides:
```
docs/
├── quickstart.md          # 5-minute getting started
├── icon-reference.md      # Complete icon usage guide
├── troubleshooting.md     # Common issues and solutions
├── contributing.md        # Detailed developer guide
└── testing.md             # Testing guidelines
```

### `/devlog` - Development Log

Chronicles of development decisions and learnings:
```
devlog/
├── README.md                                    # Devlog index
├── 2024-11-03-initial-architecture.md          # Foundation
├── 2024-11-03-renderer-system.md               # Rendering architecture
├── 2024-11-03-icon-resolution.md               # Priority system
├── 2024-11-03-performance-optimization.md      # Performance work
└── 2024-11-03-dev-automation-setup.md          # CI/CD and tooling
```

### Root Documentation Files

```
README.md                    # Main documentation (start here)
CONTRIBUTING.md             # Quick contributing guide
GETTING-STARTED-DEV.md      # Quick dev setup
DOCUMENTATION_STRUCTURE.md  # This file
CHANGELOG.md                # Version history
LICENSE                     # MIT License
```

## Finding What You Need

### "How do I use this plugin?"
→ Start with [README.md](README.md), then [Quick Start Guide](docs/quickstart.md)

### "How do I fix this issue?"
→ Check [Troubleshooting Guide](docs/troubleshooting.md)

### "How do I contribute?"
→ Start with [Quick Dev Start Guide](GETTING-STARTED-DEV.md)

### "How does this feature work?"
→ Check [Development Log](devlog/) for implementation details

### "What changed in the latest version?"
→ See [CHANGELOG.md](CHANGELOG.md)

### "How do I test my changes?"
→ Follow [Testing Guide](docs/testing.md)

## Documentation Standards

### User Documentation

**Goal**: Help users accomplish tasks quickly

**Standards**:
- Clear, concise language
- Step-by-step instructions
- Visual examples where helpful
- Common issues addressed

**Format**:
```markdown
# Feature Name

Brief description.

## How to Use

1. Step one
2. Step two
3. Step three

## Examples

[Concrete examples]

## Common Issues

[Troubleshooting]
```

### Developer Documentation

**Goal**: Help developers understand and contribute

**Standards**:
- Explain "why" not just "what"
- Include code examples
- Link to related resources
- Keep updated with code changes

**Format**:
```markdown
# Component Name

## Purpose

Why this exists

## Implementation

How it works

## Examples

[Code examples]

## References

[Links to resources]
```

### Development Log

**Goal**: Document decisions and learnings

**Standards**:
- Capture context and rationale
- Include challenges and solutions
- Show code examples
- Link to related entries

**Format**:
```markdown
# Date - Topic

## Context
[Why needed]

## Implementation
[What was built]

## Challenges
[Problems and solutions]

## Results
[Outcomes and learnings]

## Next Steps
[Future work]
```

## Contributing to Documentation

Documentation improvements are always welcome!

### Types of Contributions

1. **Fix typos and errors**
2. **Clarify confusing sections**
3. **Add missing examples**
4. **Improve organization**
5. **Add new guides**

### How to Contribute

1. Fork the repository
2. Make your changes
3. Submit a pull request
4. Explain what you improved and why

### Documentation Guidelines

- **Clear**: Use simple, direct language
- **Concise**: Get to the point quickly
- **Complete**: Include all necessary information
- **Current**: Keep in sync with code changes
- **Accessible**: Assume minimal prior knowledge

## Maintenance

### Keeping Documentation Current

When making code changes:
- [ ] Update relevant documentation
- [ ] Add devlog entry for significant changes
- [ ] Update CHANGELOG.md
- [ ] Update code examples if affected
- [ ] Check for broken links

### Regular Reviews

Periodically review documentation for:
- Outdated information
- Broken links
- Missing features
- Unclear explanations
- New user questions (common issues)

## Questions?

- **Documentation issues**: [Open an issue](https://github.com/iamJpRowan/obsidian-simple-icons/issues)
- **Suggestions**: [Start a discussion](https://github.com/iamJpRowan/obsidian-simple-icons/discussions)
- **Questions**: Check [docs/](docs/) or ask in discussions

---

**Last Updated**: November 3, 2024

