# Builder.io CLI Guide

**Date**: 2026-02-23
**Purpose**: How to use Builder.io CLI with this portfolio app
**Status**: ✅ Complete

---

## Overview

Builder.io CLI (formerly Fusion) provides tools for AI-powered code generation, Figma integration, and visual development. This guide covers how to use it with your portfolio app.

---

## Installation

The CLI is available via npx - no global installation needed:

```bash
npx @builder.io/dev-tools@latest
# or shorter alias
npx builder.io
```

---

## Authentication

Before using CLI commands, authenticate with Builder.io:

```bash
npx builder.io auth
```

This opens a browser window for OAuth login. Once authenticated, your session persists.

---

## Available Commands

### Core Commands

| Command                       | Description                                     |
| ----------------------------- | ----------------------------------------------- |
| `npx builder.io launch`       | Launch Builder Fusion development server        |
| `npx builder.io auth`         | Authenticate with Builder.io                    |
| `npx builder.io index-repo`   | Index your design system for AI code generation |
| `npx builder.io connect-repo` | Connect git repo to Builder.io Fusion           |
| `npx builder.io code`         | Generate/modify code from Figma designs         |
| `npx builder.io add`          | Add a component to your project                 |

### Figma Commands

| Command                         | Description                          |
| ------------------------------- | ------------------------------------ |
| `npx builder.io figma generate` | Auto-map Figma component URLs        |
| `npx builder.io figma publish`  | Publish Figma mappings to Builder.io |
| `npx builder.io figma migrate`  | Migrate mappings to local files      |
| `npx builder.io figma auth`     | Authenticate with Figma              |

---

## Code Generation

### Basic Usage

```bash
# Generate code from a Figma URL
npx builder.io code --url "https://figma.com/file/..."
```

### Options

```bash
npx builder.io code --url URL [options]

Options:
  --url            Figma/design URL to generate from
  --spaceId        Builder.io space ID (auto-detected when authenticated)
  --prompt         Prompt for non-interactive mode
  --workspace      Workspace config for multi-root projects
  --mode           'exact' (precise) or 'creative' (flexible)
  --cwd            Working directory
  --disableMcp     Disable MCP server support
  --privacyMode    Enable privacy mode (encrypts sensitive data)
```

### Configuration Files

Create these files in project root for customization:

- `.builderignore` - Patterns to exclude from code generation
- `.builderrules` - Custom LLM prompt instructions
- `.cursorrules` - Cursor IDE compatibility (auto-supported)

---

## VS Code Insiders Integration

### Setup for Full Sync

This project is configured for seamless integration with VS Code Insiders and Builder.io:

1. **Cursor Rules** - A `.cursorrules` file has been added with Builder.io guidelines

2. **VS Code Settings** - Updated `.vscode/settings.json` with:
   - File watcher exclusions for better performance
   - TypeScript formatting with Biome
   - Auto-format on save

3. **HMR Configuration** - Vite is configured with:
   - Port 8082 for the dev server
   - Port 24681 for HMR connections
   - File watching in `client/components/` and `client/lib/`

### Workflow

1. Start both servers:

   ```bash
   pnpm run dev:all
   ```

2. In a separate terminal, launch Builder.io:

   ```bash
   npx builder.io launch
   ```

3. Make changes in either:
   - VS Code - edits auto-sync via HMR
   - Builder.io visual editor - changes sync to local files

4. Both will reflect changes in real-time

### File Watching

The following directories are watched for changes:

- `client/components/` - All React components
- `client/lib/` - Utilities including builder-registry.ts
- `client/pages/` - Page components

---

## Figma Integration

### Auto-Map Components

```bash
# Start wizard for Figma component URLs
npx builder.io figma generate "https://figma.com/file/xxx?node-id=xxx"

# Multiple URLs
npx builder.io figma generate "url1" "url2" "url3"
```

### Publish Mappings

```bash
# Push your Figma mappings to Builder.io
npx builder.io figma publish
```

### Migrate to Local

```bash
# Download mappings as local files
npx builder.io figma migrate
```

---

## Usage with Your Portfolio App

### 1. Setup Environment

Ensure your `.env` file has the Builder.io API key:

```bash
# .env
VITE_BUILDER_PUBLIC_API_KEY=your_api_key_here
```

Get your key from: https://builder.io → Account Settings → API Keys

### 2. Launch Development Server

```bash
# Start Builder.io dev server (runs on port 48752)
npx builder.io launch
```

This opens the visual editor at http://localhost:48752

### 3. Generate Components

```bash
# Generate a component from Figma design
npx builder.io code --url "https://figma.com/your-design"
```

The generated code will be placed in your project based on the configuration.

### 4. Add Components

```bash
# Interactive wizard to add new components
npx builder.io add
```

---

## Integration with Existing Setup

Your app already has Builder.io integration:

- **SDK**: `@builder.io/react` v9.1.2, `@builder.io/sdk-react` v5.1.1
- **Components**: `BuilderProvider`, `BuilderContent`
- **Usage**: See `BUILDER.IO_SETUP.md` and `BUILDER.IO_INTEGRATION.md`

### Using CLI with Existing Components

1. Launch dev server:

   ```bash
   npx builder.io launch
   ```

2. Open http://localhost:48752 in browser

3. Select your existing components in the visual editor

4. Make edits visually - changes sync to your code

---

## Common Workflows

### Workflow 1: Design to Code

1. Design component in Figma
2. Copy Figma URL
3. Run: `npx builder.io code --url "Figma_URL"`
4. Review and accept generated code
5. Component added to your project

### Workflow 2: Visual Editing

1. Run: `npx builder.io launch`
2. Open visual editor in browser
3. Select page/component to edit
4. Drag-and-drop changes
5. Save - code updates automatically

### Workflow 3: Figma Sync

1. Connect Figma: `npx builder.io figma auth`
2. Map components: `npx builder.io figma generate "url"`
3. Publish: `npx builder.io figma publish`
4. Components available in visual editor

---

## Troubleshooting

### "Not authenticated" Error

```bash
# Run auth first
npx builder.io auth
```

### API Key Issues

- Verify `VITE_BUILDER_PUBLIC_API_KEY` is set in `.env`
- Check key is valid at https://builder.io/settings/api-keys

### Server Already Running

If port 48752 is in use:

```bash
# Kill existing process
pkill -f "builder.io"

# Or use different port (if supported)
npx builder.io launch --port 48753
```

### Figma Connection Issues

```bash
# Re-authenticate with Figma
npx builder.io figma auth
```

---

## Getting Help

```bash
# General help
npx builder.io --help

# Specific command help
npx builder.io code --help
npx builder.io figma --help
```

---

## Additional Resources

- [Builder.io Documentation](https://www.builder.io/docs)
- [Builder.io CLI Reference](https://builder.io/docs/cli)
- [React SDK Guide](https://www.builder.io/c/docs/react)

---

**Last Updated**: 2026-02-23
**Version**: 1.0.0
