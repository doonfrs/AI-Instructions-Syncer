# AI Tools Configuration Files Reference (2025)

This document provides a comprehensive, researched list of configuration files used by popular AI coding assistants and IDEs. All paths have been verified through official documentation.

## Verified Configuration Files

### Claude Code (Anthropic)
- **Main file**: `CLAUDE.md`
- **Local overrides**: `CLAUDE.local.md` (gitignored)
- **Location**: Project root
- **Notes**: Claude automatically pulls CLAUDE.md into context. Can also be placed in parent/child directories or `~/.claude/CLAUDE.md` for global rules.

### Cursor IDE
- **Legacy (still supported)**: `.cursorrules`
- **New system (recommended)**: `.cursor/rules/*.mdc`
- **Location**: Project root
- **Notes**: Moving to modular MDC (Markdown Components) format. Legacy `.cursorrules` will eventually be deprecated.

### GitHub Copilot
- **Repository-wide**: `.github/copilot-instructions.md`
- **Path-specific**: `.github/instructions/*.instructions.md`
- **Agent-specific**: `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`
- **Location**: As specified in paths
- **Notes**: Supports YAML frontmatter in `.instructions.md` files for path-scoping.

### Windsurf IDE (by Codeium)
- **Project rules**: `.windsurfrules`
- **Modular rules**: `.windsurf/rules/*.md`
- **Location**: Project root
- **Notes**: Can also be configured via Settings > Set Workspace AI Rules.

### Aider AI
- **Main config**: `.aider.conf.yml`
- **Model settings**: `.aider.model.settings.yml`
- **Model metadata**: `.aider.model.metadata.json`
- **Location**: Project root, home directory, or current directory
- **Notes**: Supports environment variables via `.env` file.

### Continue.dev
- **Project level**: `.continuerc.json`
- **User level**: `~/.continue/config.yaml`
- **Location**: Project root for `.continuerc.json`
- **Notes**: Main configuration is user-level. Project file merges with or overwrites user config.

### Amazon Q Developer (formerly CodeWhisperer)
- **Configuration**: Through AWS Toolkit settings
- **Rules**: Configured via IDE integration
- **Notes**: Uses rule-based system with unique IDs for traceable instructions. No specific file format documented.

### Codeium
- **Ignore file**: `.codeiumignore`
- **Location**: Project root
- **Notes**: Uses gitignore syntax. No specific rules/instructions file found.

### Supermaven
- **Configuration**: Through IDE extension settings
- **Notes**: No specific configuration file found. Configured through IDE extensions.

## Common Patterns

1. **Root-level files**: Most tools use files in the project root (CLAUDE.md, .cursorrules, .windsurfrules)
2. **Hidden directories**: Many tools use dot-prefixed directories (.github/, .cursor/, .windsurf/)
3. **YAML format**: Popular for configuration (Aider, Continue)
4. **Markdown format**: Preferred for rules and instructions
5. **Hierarchical override**: Many tools support global → project → local configuration hierarchy

## Best Practices

1. **Version control**: Commit shared rules files, gitignore personal overrides
2. **Documentation**: Keep rules concise and well-commented
3. **Testing**: Verify rules work as expected before committing
4. **Team alignment**: Ensure team agrees on shared rules
5. **Regular updates**: Review and update rules as project evolves

## Migration Notes

- **Cursor**: Migrating from `.cursorrules` to `.cursor/rules/*.mdc`
- **GitHub Copilot**: CodeWhisperer features now part of Amazon Q Developer
- **Continue**: Moving from JSON to YAML configuration

## Resources

- [Claude Code Documentation](https://www.anthropic.com/claude-code)
- [Cursor Rules Documentation](https://docs.cursor.com/context/rules)
- [GitHub Copilot Instructions](https://docs.github.com/copilot/customizing-copilot/adding-custom-instructions-for-github-copilot)
- [Windsurf Documentation](https://docs.windsurf.com)
- [Aider Configuration](https://aider.chat/docs/config.html)
- [Continue Configuration](https://docs.continue.dev/reference)