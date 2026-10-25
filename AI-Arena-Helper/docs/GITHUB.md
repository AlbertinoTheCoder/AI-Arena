# Keep AI Arena in VS Code and on GitHub

Your local repository stays in `E:\projects\WebProjects\ai-arena`. GitHub is a remote copy of its Git history; publishing does not move or remove the local folder. VS Code and command-line Git operate on the same repository.

## First publication from VS Code

1. Use **File → Open Folder** and choose `E:\projects\WebProjects\ai-arena`.
2. Open **Source Control** (`Ctrl+Shift+G`). Review the source files. Local `.arena` data, consent records, CLI transcripts, `.venv`, logs, and environment-secret files are ignored. Do not add ignored runtime folders manually.
3. If your name and email are not configured for Git, configure the identity you want recorded publicly in commits. Prefer your GitHub no-reply email if you do not want to publish your personal email. In this repository's terminal, use `git config user.name "YOUR COMMIT NAME"` and `git config user.email "YOUR CHOSEN COMMIT EMAIL"`. These repository-local settings do not change your other projects.
4. Stage the reviewed source files and create the first commit with a message such as `Build local AI Arena`.
5. Press `Ctrl+Shift+P`, choose **Publish to GitHub**, sign in if requested, enter a repository name, and select private or public visibility. This creates a GitHub repository, adds it as the `origin` remote, and pushes your commit. If the GitHub repository already exists, add that existing remote instead of creating a second repository.

After publication, keep editing this same folder in VS Code. Commit locally, then **Push** to upload. **Sync Changes** pulls remote changes before pushing. On another computer, clone the GitHub repository into that computer's workspace and install the local CLI/TTS dependencies separately.

## Existing GitHub repository

If you already created an empty repository on GitHub, run the following in the AI Arena terminal after your first commit, replacing the example URL with your actual repository URL:

```powershell
git remote add origin https://github.com/YOUR-ACCOUNT/YOUR-REPOSITORY.git
git push -u origin main
```

Only add `origin` if it is not already configured; inspect it with `git remote -v`. Never force-push to solve an authentication or synchronization problem.

## What publication does

This is a source repository for a local Node.js/CLI application. GitHub Pages cannot run the local Node backend or your installed authenticated CLIs. Each user runs their own copy and uses their own CLI accounts. Do not expose the loopback CLI server to the public Internet.

The included Terms of Use are an implementation draft for review. Before offering an operated public service, identify its operator, contact details, jurisdiction and actual privacy practices, and obtain appropriate legal review. A disclaimer does not eliminate liabilities that applicable law does not allow you to exclude. The project does not currently include a separate source-code license; decide on one before inviting reuse under open-source terms.

Reference: https://code.visualstudio.com/docs/sourcecontrol/repos-remotes
