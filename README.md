# AI Instructions Syncer

![Demo](assets/demo.gif)

A VS Code extension that automatically syncs your AI assistant instructions to multiple files when you save your main instructions file. Perfect for developers who use multiple AI assistants (Claude, Cursor, GitHub Copilot, Windsurf) and want to keep their instructions synchronized across different tools and projects.

**⭐ If this extension saves you time and makes your workflow smoother, please consider starring the repository! Your support means the world to us and helps the project grow. ⭐**

## ☕ Support

If this extension helps you, consider supporting the development:

[![Buy Me A Coffee](https://img.shields.io/badge/Buy%20Me%20A%20Coffee-☕-orange.svg?style=flat-square)](https://buymeacoffee.com/doonfrs)

**Your support helps maintain and improve this extension!**

## 🚀 Features

- **Zero Configuration Required** - Works out of the box with sensible defaults
- **Cross-Platform Support** - Windows, macOS, Linux, and WSL/WSL2 compatible
- **Smart File Watching** - Automatically detects when your AI instructions file is saved
- **Multi-Target Sync** - Sync to multiple files with different names (CLAUDE.md, .cursorrules, etc.)
- **Auto & Manual Sync** - Automatic syncing on save (default) with option to disable and sync manually
- **Verified AI Tool Support** - Pre-configured paths for Claude, Cursor, GitHub Copilot, Windsurf, and more
- **Folder Path Support** - Create files in nested directories (`.windsurf/rules/rules.md`, `.github/copilot-instructions.md`)
- **Automatic Directory Creation** - Creates folder structure automatically if it doesn't exist
- **Project-Based Configuration** - Config file travels with your project, no global settings
- **Comment Support** - YAML config with comments to easily enable/disable target files
- **One-Click Setup** - Generate AI rules template and config with a single command
- **Real-Time Sync** - Changes are synced immediately when you save your rules file
- **Flexible File Organization** - Support for any file structure and naming convention
- **Git-Friendly** - Configuration file can be committed and shared with your team

## 📋 Prerequisites

- Visual Studio Code 1.74.0 or higher
- A workspace/project folder (extension works with project-based configuration)

## 🌟 Show Your Support

If you find this extension useful:

- ⭐ **Star this repository** on GitHub
- 📝 **Leave a review** on the VS Code Marketplace
- 🐛 **Report issues** or suggest features
- 💬 **Share** with other developers

## 🎯 Use Cases

### Multi-AI Assistant Workflow
Perfect for developers using multiple AI assistants:
1. Create your main AI rules in `ai-rules.md`
2. Extension automatically syncs to `CLAUDE.md`, `.cursorrules`, `.github/copilot-instructions.md`, etc.
3. Each AI tool reads its specific rules file
4. Maintain consistency across all your AI interactions

### Team Collaboration
- Share standardized AI instructions across team members
- Commit configuration to version control
- Ensure everyone uses the same AI interaction guidelines
- Easy onboarding for new team members

### Project-Specific Rules
- Different instructions for different types of projects
- Frontend vs backend specific guidelines
- Framework-specific AI instructions
- Custom coding standards per project


## ⚙️ Installation

### From VS Code Marketplace
1. Open VS Code
2. Go to Extensions (`Ctrl+Shift+X`)
3. Search for "AI Instructions Syncer"
4. Click "Install"

### From VSIX
1. Download the latest `.vsix` file from releases
2. Open VS Code
3. Press `Ctrl+Shift+P` and type "Install from VSIX"
4. Select the downloaded file


## 🔧 Usage

### Quick Start
1. Open Command Palette (`Ctrl+Shift+P`)
2. Type "AI Instructions Syncer: Generate AI Instructions File"
3. Execute the command to create `ai-rules.md` and `ai-rules.config.yaml`
4. Edit your AI rules in `ai-rules.md`
5. Save the file - your rules are automatically synced to target files!

### Available Commands
Open Command Palette (`Ctrl+Shift+P`) and use these commands:

- **"AI Instructions Syncer: Generate AI Instructions File"** - Create template files and configuration
- **"AI Instructions Syncer: Sync AI Instructions Now"** - Manually sync instructions to all target files

### Automatic Syncing
Once set up, the extension works automatically:
- Edit `ai-rules.md` (or your configured source file)
- Save the file (`Ctrl+S`)
- Extension syncs content to all target files defined in your config

### Manual Syncing
You can also sync manually or disable auto-sync:
- Use "AI Instructions Syncer: Sync AI Instructions Now" command
- Set `autoSync: false` in config to disable automatic syncing

## ⚙️ Configuration

The extension uses a project-local YAML configuration file that supports comments.

### Configuration Options

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `sourceFile` | string | `ai-rules.md` | The main AI rules file that triggers syncing when saved |
| `targetFiles` | array | `[CLAUDE.md, .cursorrules]` | List of files to sync to (supports folder paths) |
| `autoSync` | boolean | `true` | Enable automatic syncing on save (set to false for manual sync only) |

### Editing Configuration

1. Open `ai-rules.config.yaml` in your project root
2. Edit the settings as needed
3. Use `#` to comment out target files you want to disable

### Folder Path Support

The extension supports creating files in nested directories:

```yaml
targetFiles:
  - CLAUDE.md                             # Claude Code
  - .cursorrules                          # Cursor IDE (legacy but still supported)
  - .github/copilot-instructions.md       # GitHub Copilot repository-wide instructions
  - .windsurf/rules/rules.md              # Windsurf rules directory
  - docs/ai-guidelines.md                 # Any custom folder structure
```

Folders are created automatically if they don't exist.

### Commenting Target Files

Enable/disable target files by commenting them out:

```yaml
targetFiles:
  - CLAUDE.md                             # Active - Claude Code
  - .cursorrules                          # Active - Cursor IDE
  # - .github/copilot-instructions.md     # Disabled (commented out)
  - .windsurf/rules/rules.md              # Active - Windsurf IDE
```

### Custom Source File

Change the source file that triggers syncing:

```yaml
sourceFile: my-custom-rules.md     # Instead of ai-rules.md
targetFiles:
  - CLAUDE.md
  - .cursorrules
autoSync: true                     # Enable automatic syncing (default)
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

### Development Setup
1. Clone this repository
2. Run `npm install`
3. Open in VS Code
4. Press `F5` to launch extension development host
5. Test your changes


## 📝 Changelog

### v0.0.1
- Initial release
- Project-based YAML configuration with comment support
- Automatic file syncing on save
- Folder path support with automatic directory creation
- Multi-target file synchronization
- Cross-platform compatibility (Windows, macOS, Linux, WSL/WSL2)
- One-click setup with AI instructions template generation
- Git-friendly configuration files
- Real-time sync notifications


## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 💬 Connect

- 🐙 **GitHub**: [@doonfrs](https://github.com/doonfrs)
- ☕ **Support**: [Buy me a coffee](https://buymeacoffee.com/doonfrs)

Made with ❤️ for developers using multiple AI assistants
