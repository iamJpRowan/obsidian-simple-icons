#!/bin/bash
# Pre-commit check script that runs all CI checks
# This ensures commits don't break CI

set -e

echo "🔍 Running pre-commit checks..."
echo ""

# Run lint check
echo "1️⃣  Running lint check..."
npm run lint || {
  echo "❌ Lint check failed. Run 'npm run lint:fix' to fix issues."
  exit 1
}

# Run format check
echo "2️⃣  Running format check..."
npx prettier --check "src/**/*.{ts,css}" || {
  echo "❌ Format check failed. Run 'npm run format' to fix issues."
  exit 1
}

# Run type check
echo "3️⃣  Running type check..."
npm run type-check || {
  echo "❌ Type check failed. Fix TypeScript errors before committing."
  exit 1
}

# Run build check
echo "4️⃣  Running build check..."
npm run build || {
  echo "❌ Build check failed. Fix build errors before committing."
  exit 1
}

echo ""
echo "✅ All checks passed! Proceeding with commit..."

