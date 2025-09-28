const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

function activate(context) {
    console.log('AI Rules Syncer extension is now active');

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
                            .map(f => f.trim().replace(/['"]/g, ''))
                            .filter(f => f.length > 0);
                    }
                } else {
                    config[cleanKey] = cleanValue.replace(/['"]/g, '');
                }
            } else if (trimmed.startsWith('- ')) {
                // YAML array item
                if (!config.targetFiles) config.targetFiles = [];
                const item = trimmed.slice(2).trim().replace(/['"]/g, '');
                if (item) config.targetFiles.push(item);
            }
        }

        return config;
    };

    // Function to read config file
    const readConfig = (workspacePath) => {
        const configPath = path.join(workspacePath, 'ai-rules.config.yaml');
        const defaultConfig = {
            sourceFile: 'ai-rules.md',
            targetFiles: ['CLAUDE.md', 'cursor.md']
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
        const defaultConfigContent = `# AI Rules Syncer Configuration
# This file controls which files get synced when you save your AI rules

# Source file that triggers the sync (default: ai-rules.md)
sourceFile: ai-rules.md

# Target files to sync to (supports both files and folder paths)
# Folders will be created automatically if they don't exist
targetFiles:
  - CLAUDE.md                    # File in root directory
  - cursor.md                    # File in root directory
  - .cursor/rules.md             # File in .cursor folder
  # - settings/.cursors/rules.md # File in nested folders
  # - copilot.md                 # Commented out file
  # - .github/ai-rules.md        # File in .github folder
`;

        try {
            fs.writeFileSync(configPath, defaultConfigContent);
            return true;
        } catch (error) {
            console.error('Error creating config file:', error.message);
            return false;
        }
    };

    // Register command to generate AI rules file
    const generateRulesCommand = vscode.commands.registerCommand('aiRulesSyncer.generateRulesFile', async () => {
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
            const template = `# AI Rules

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

                    fs.writeFileSync(targetPath, content);
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

    // Watch for file saves
    const saveWatcher = vscode.workspace.onDidSaveTextDocument((document) => {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) return;

        const workspacePath = workspaceFolder.uri.fsPath;
        const config = readConfig(workspacePath);
        const sourceFile = config.sourceFile || 'ai-rules.md';
        const sourceFilePath = path.join(workspacePath, sourceFile);

        // Check if the saved file is our source file
        if (document.uri.fsPath === sourceFilePath) {
            syncFiles(sourceFilePath);
        }
    });

    context.subscriptions.push(generateRulesCommand, saveWatcher);
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};