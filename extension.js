const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

function activate(context) {
    console.log('AI Instructions Syncer extension is now active');

    // Function to parse simple YAML-like config
    const parseSimpleYaml = (content) => {
        const config = {};
        const lines = content.split('\n');

        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#')) continue;

            if (trimmed.includes(':')) {
                const [key, value] = trimmed.split(':', 2);
                const cleanKey = key.trim();
                const cleanValue = value.trim();

                if (cleanKey === 'targetFiles') {
                    // Parse array format: [file1, file2] or yaml list format
                    if (cleanValue.startsWith('[') && cleanValue.endsWith(']')) {
                        config[cleanKey] = cleanValue.slice(1, -1)
                            .split(',')
                            .map(f => {
                                let item = f.trim().replace(/['"]/g, '');
                                // Strip inline comments
                                const commentIndex = item.indexOf('#');
                                if (commentIndex !== -1) {
                                    item = item.substring(0, commentIndex).trim();
                                }
                                return item;
                            })
                            .filter(f => f.length > 0);
                    }
                } else {
                    config[cleanKey] = cleanValue.replace(/['"]/g, '');
                }
            } else if (trimmed.startsWith('- ')) {
                // YAML array item
                if (!config.targetFiles) config.targetFiles = [];
                let item = trimmed.slice(2).trim().replace(/['"]/g, '');
                // Strip inline comments
                const commentIndex = item.indexOf('#');
                if (commentIndex !== -1) {
                    item = item.substring(0, commentIndex).trim();
                }
                if (item) config.targetFiles.push(item);
            }
        }

        return config;
    };

    // Function to parse frontmatter and check for alwaysApply
    const parseFrontmatter = (content) => {
        const lines = content.split('\n');
        if (lines.length < 3) return { hasFrontmatter: false, hasAlwaysApply: false };

        // Check if first line starts with ---
        if (!lines[0].trim().startsWith('---')) {
            return { hasFrontmatter: false, hasAlwaysApply: false };
        }

        // Find the closing --- (should be within first few lines)
        let closingIndex = -1;
        for (let i = 1; i < Math.min(lines.length, 10); i++) {
            if (lines[i].trim() === '---') {
                closingIndex = i;
                break;
            }
        }

        if (closingIndex === -1) {
            return { hasFrontmatter: false, hasAlwaysApply: false };
        }

        // Extract frontmatter content
        const frontmatterLines = lines.slice(1, closingIndex);
        const bodyLines = lines.slice(closingIndex + 1);

        // Check if alwaysApply exists in the frontmatter
        let hasAlwaysApply = false;
        for (const line of frontmatterLines) {
            if (line.trim().startsWith('alwaysApply:')) {
                hasAlwaysApply = true;
                break;
            }
        }

        return {
            hasFrontmatter: true,
            hasAlwaysApply: hasAlwaysApply,
            frontmatterLines: frontmatterLines,
            bodyLines: bodyLines
        };
    };

    // Function to add or update frontmatter with alwaysApply
    const ensureAlwaysApplyFrontmatter = (content, alwaysApplyValue = true) => {
        const parsed = parseFrontmatter(content);

        if (!parsed.hasFrontmatter) {
            // No frontmatter exists, add new one
            const frontmatter = `---\nalwaysApply: ${alwaysApplyValue}\n---\n\n`;
            return frontmatter + content;
        } else if (!parsed.hasAlwaysApply) {
            // Frontmatter exists but no alwaysApply, add it
            const frontmatterLines = [...parsed.frontmatterLines, `alwaysApply: ${alwaysApplyValue}`];
            const newContent = [
                '---',
                ...frontmatterLines,
                '---',
                ...parsed.bodyLines
            ].join('\n');
            return newContent;
        } else {
            // Both frontmatter and alwaysApply exist, don't touch it
            return content;
        }
    };

    // Function to read config file
    const readConfig = (workspacePath) => {
        const configPath = path.join(workspacePath, 'ai-rules.config.yaml');
        const defaultConfig = {
            sourceFile: 'ai-rules.md',
            targetFiles: [],  // No default target files - must be configured in YAML
            autoSync: true,   // Auto sync is enabled by default
            cursorMdcAlwaysApply: true  // Default value for alwaysApply in Cursor MDC files
        };

        try {
            if (fs.existsSync(configPath)) {
                const configContent = fs.readFileSync(configPath, 'utf8');
                const parsedConfig = parseSimpleYaml(configContent);
                return { ...defaultConfig, ...parsedConfig };
            }
        } catch (error) {
            console.error('Error reading config file:', error.message);
        }

        return defaultConfig;
    };

    // Function to create default config file
    const createConfigFile = (workspacePath) => {
        const configPath = path.join(workspacePath, 'ai-rules.config.yaml');
        let defaultConfigContent = `# AI Instructions Syncer Configuration
# This file controls which files get synced when you save your AI rules

# Source file that triggers the sync (default: ai-rules.md)
sourceFile: ai-rules.md

# Target files to sync to (supports both files and folder paths)
# Folders will be created automatically if they don't exist
targetFiles:
  # - CLAUDE.md                         # Claude Code (Anthropic) - main rules file
  # - .cursorrules                      # Cursor IDE - legacy but still supported
  # - .github/copilot-instructions.md  # GitHub Copilot - repository-wide instructions
  # - .windsurf/rules/rules.md         # Windsurf IDE - project rules

# Additional configuration options
autoSync: true                          # Enable automatic syncing on save (default: true)
`;

        // Try to read template file, fallback to hardcoded template
        const templatePath = path.join(__dirname, 'ai-rules.config.template.yaml');
        try {
            if (fs.existsSync(templatePath)) {
                defaultConfigContent = fs.readFileSync(templatePath, 'utf8');
            }
        } catch (error) {
            console.warn('Could not read ai-rules.config.template.yaml, using default template:', error.message);
        }

        try {
            fs.writeFileSync(configPath, defaultConfigContent);
            return true;
        } catch (error) {
            console.error('Error creating config file:', error.message);
            return false;
        }
    };

    // Register command to generate AI rules file
    const generateInstructionsCommand = vscode.commands.registerCommand('aiInstructionsSyncer.generateInstructionsFile', async () => {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
            vscode.window.showErrorMessage('No workspace folder found');
            return;
        }

        const workspacePath = workspaceFolder.uri.fsPath;
        const config = readConfig(workspacePath);
        const sourceFile = config.sourceFile;
        const sourceFilePath = path.join(workspacePath, sourceFile);

        // Create config file if it doesn't exist
        const configPath = path.join(workspacePath, 'ai-rules.config.yaml');
        if (!fs.existsSync(configPath)) {
            createConfigFile(workspacePath);
            vscode.window.showInformationMessage('Created ai-rules.config.yaml');
        }

        // Create basic AI rules template if file doesn't exist
        if (!fs.existsSync(sourceFilePath)) {
            let template = `# AI Rules

## General Guidelines
- Write clear and concise code
- Follow project conventions
- Add appropriate comments

## Code Style
- Use consistent indentation
- Use meaningful variable names
- Keep functions small and focused

## Documentation
- Document complex logic
- Update README when needed
- Add inline comments for clarity
`;

            // Try to read template file, fallback to hardcoded template
            const templatePath = path.join(__dirname, 'ai-rules.template.md');
            try {
                if (fs.existsSync(templatePath)) {
                    template = fs.readFileSync(templatePath, 'utf8');
                }
            } catch (error) {
                console.warn('Could not read ai-rules.template.md, using default template:', error.message);
            }

            try {
                fs.writeFileSync(sourceFilePath, template);
                vscode.window.showInformationMessage(`Created ${sourceFile}`);

                // Open the file
                const doc = await vscode.workspace.openTextDocument(sourceFilePath);
                await vscode.window.showTextDocument(doc);
            } catch (error) {
                vscode.window.showErrorMessage(`Failed to create ${sourceFile}: ${error.message}`);
            }
        } else {
            vscode.window.showInformationMessage(`${sourceFile} already exists`);
            // Open the existing file
            const doc = await vscode.workspace.openTextDocument(sourceFilePath);
            await vscode.window.showTextDocument(doc);
        }
    });

    // Function to copy source file to target files
    const syncFiles = (sourceFilePath) => {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder || !fs.existsSync(sourceFilePath)) {
            return;
        }

        const workspacePath = workspaceFolder.uri.fsPath;
        const config = readConfig(workspacePath);
        const targetFiles = config.targetFiles || [];

        // Do nothing if no target files are configured
        if (targetFiles.length === 0) {
            console.log('No target files configured in ai-rules.config.yaml');
            return;
        }

        try {
            const content = fs.readFileSync(sourceFilePath, 'utf8');

            targetFiles.forEach(targetFile => {
                const targetPath = path.join(workspacePath, targetFile);
                try {
                    // Create directory if it doesn't exist
                    const targetDir = path.dirname(targetPath);
                    if (!fs.existsSync(targetDir)) {
                        fs.mkdirSync(targetDir, { recursive: true });
                        console.log(`Created directory: ${path.relative(workspacePath, targetDir)}`);
                    }

                    let finalContent = content;

                    // Special handling for .mdc files (Cursor MDC format)
                    if (targetFile.endsWith('.mdc')) {
                        // For .mdc files, we need to preserve existing frontmatter in the target file
                        // but ensure alwaysApply exists. If target file doesn't exist, add frontmatter to source content.
                        let targetExistingContent = '';
                        let targetHasContent = false;

                        try {
                            if (fs.existsSync(targetPath)) {
                                targetExistingContent = fs.readFileSync(targetPath, 'utf8');
                                targetHasContent = true;
                            }
                        } catch (error) {
                            // Target file doesn't exist or can't be read, proceed with source content
                        }

                        const alwaysApplyValue = config.cursorMdcAlwaysApply !== undefined ?
                            config.cursorMdcAlwaysApply : true;

                        if (targetHasContent) {
                            // Target file exists, check if it has frontmatter we should preserve
                            const targetParsed = parseFrontmatter(targetExistingContent);
                            if (targetParsed.hasFrontmatter && targetParsed.hasAlwaysApply) {
                                // Target has frontmatter with alwaysApply, just update the body content
                                const sourceParsed = parseFrontmatter(content);
                                const sourceBody = sourceParsed.hasFrontmatter ?
                                    sourceParsed.bodyLines.join('\n') : content;

                                finalContent = [
                                    '---',
                                    ...targetParsed.frontmatterLines,
                                    '---',
                                    sourceBody
                                ].join('\n');
                                console.log(`Preserved existing frontmatter in ${targetFile}`);
                            } else {
                                // Target exists but no proper frontmatter, treat like new file
                                finalContent = ensureAlwaysApplyFrontmatter(content, alwaysApplyValue);
                                console.log(`Added alwaysApply frontmatter to ${targetFile} (value: ${alwaysApplyValue})`);
                            }
                        } else {
                            // Target file doesn't exist, create with frontmatter
                            finalContent = ensureAlwaysApplyFrontmatter(content, alwaysApplyValue);
                            console.log(`Created ${targetFile} with alwaysApply frontmatter (value: ${alwaysApplyValue})`);
                        }
                    }

                    fs.writeFileSync(targetPath, finalContent);
                    console.log(`Synced to ${targetFile}`);
                } catch (error) {
                    console.error(`Failed to sync to ${targetFile}:`, error.message);
                }
            });

            if (targetFiles.length > 0) {
                vscode.window.showInformationMessage(`Synced to ${targetFiles.length} target file(s)`);
            }
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to read source file: ${error.message}`);
        }
    };

    // Register command to manually sync files
    const syncCommand = vscode.commands.registerCommand('aiInstructionsSyncer.syncFiles', () => {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
            vscode.window.showErrorMessage('No workspace folder found');
            return;
        }

        const workspacePath = workspaceFolder.uri.fsPath;
        const config = readConfig(workspacePath);
        const sourceFile = config.sourceFile || 'ai-rules.md';
        const sourceFilePath = path.join(workspacePath, sourceFile);

        if (!fs.existsSync(sourceFilePath)) {
            vscode.window.showErrorMessage(`Source file ${sourceFile} not found. Run 'Generate AI Instructions File' first.`);
            return;
        }

        syncFiles(sourceFilePath);
    });

    // Watch for file saves
    const saveWatcher = vscode.workspace.onDidSaveTextDocument((document) => {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) return;

        const workspacePath = workspaceFolder.uri.fsPath;
        const config = readConfig(workspacePath);

        // Check if autoSync is enabled (default is true)
        if (config.autoSync === false) {
            return;  // Don't auto-sync if disabled
        }

        const sourceFile = config.sourceFile || 'ai-rules.md';
        const sourceFilePath = path.join(workspacePath, sourceFile);
        const configFilePath = path.join(workspacePath, 'ai-rules.config.yaml');

        // Check if the saved file is our source file or config file
        if (document.uri.fsPath === sourceFilePath) {
            syncFiles(sourceFilePath);
        } else if (document.uri.fsPath === configFilePath) {
            // Config file was saved, sync using current source file if it exists
            if (fs.existsSync(sourceFilePath)) {
                console.log('Config file changed, re-syncing...');
                syncFiles(sourceFilePath);
            }
        }
    });

    context.subscriptions.push(generateInstructionsCommand, syncCommand, saveWatcher);
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};