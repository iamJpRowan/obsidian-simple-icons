# VAULT_PATH Migration Guide

## What Changed

The environment variable for development has been simplified:

**Before:**
```bash
VAULT_PLUGIN_PATH=/path/to/vault/.obsidian/plugins/simple-icons
```

**After:**
```bash
VAULT_PATH=/path/to/vault
```

The build script now automatically appends `.obsidian/plugins/simple-icons` to your vault path.

## Why This Change?

1. **Simpler** - Just point to your vault, not the full plugin path
2. **Less error-prone** - No need to remember the exact plugin directory structure
3. **More intuitive** - You're working with your vault, not a specific plugin folder

## For Existing Developers

If you already have a `.env` file with `VAULT_PLUGIN_PATH`, you need to update it:

### Option 1: Quick Update

```bash
# If your old .env was:
# VAULT_PLUGIN_PATH=/Users/you/vault/.obsidian/plugins/simple-icons

# Change it to:
# VAULT_PATH=/Users/you/vault
```

### Option 2: Use the Example

```bash
# Remove old .env and start fresh
rm .env
cp .env.example .env
# Edit .env with your vault path
```

## Technical Details

The `esbuild.config.mjs` now:

1. **Checks for `VAULT_PLUGIN_PATH` first** (for CI/CD compatibility)
2. **Falls back to `VAULT_PATH`** (for development)
3. **Automatically constructs** the plugin directory path when using `VAULT_PATH`

### For CI/CD

The GitHub Actions workflows continue to use `VAULT_PLUGIN_PATH=./build` because they need direct control over the output directory. This maintains backward compatibility.

### Code Changes

```javascript
// Before
const outDir = process.env.VAULT_PLUGIN_PATH

// After
let outDir
if (process.env.VAULT_PLUGIN_PATH) {
  outDir = process.env.VAULT_PLUGIN_PATH
} else if (process.env.VAULT_PATH) {
  outDir = path.join(process.env.VAULT_PATH, ".obsidian", "plugins", "simple-icons")
}
```

## Updated Documentation

The following files have been updated:
- `esbuild.config.mjs` - Build configuration
- `GETTING-STARTED-DEV.md` - Development setup guide
- `CONTRIBUTING.md` - Contributing guide
- `SETUP.md` - Setup guide
- `devlog/2024-11-03-dev-automation-setup.md` - Development log
- `.gitignore` - Added `!.env.example` to allow example file
- `.env.example` - New example file with comments

## Troubleshooting

### Error: "Neither VAULT_PATH nor VAULT_PLUGIN_PATH is set"

Create a `.env` file:
```bash
cp .env.example .env
# Edit and set your vault path
```

### Plugin not appearing in Obsidian

Make sure:
1. Your `.env` file has the correct vault path
2. The vault is open in Obsidian
3. You've enabled community plugins
4. You've reloaded Obsidian (Cmd/Ctrl + R)

### Build files going to wrong location

Check your `.env` file - the path should be to your vault root, not the plugin directory.

```bash
# ✅ Correct
VAULT_PATH=/Users/you/Documents/MyVault

# ❌ Wrong (old format)
VAULT_PATH=/Users/you/Documents/MyVault/.obsidian/plugins/simple-icons
```

---

**Date:** November 3, 2024  
**Status:** Complete
