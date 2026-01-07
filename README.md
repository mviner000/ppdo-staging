# PPDO Next Project

## 📝 Git Commit Guide

Follow these commit message prefixes to keep our git history clean and organized!

### Common Commit Types

| Prefix   | Meaning                                                                 | Example |
|----------|-------------------------------------------------------------------------|---------|
| **feat:**    | Introduces a new feature                                               | `feat: add user profile page` |
| **fix:**     | Fixes a bug                                                            | `fix: resolve login redirect issue` |
| **docs:**    | Documentation changes only                                             | `docs: update README with setup steps` |
| **style:**   | Code style changes (formatting, missing semicolons, no logic changes) | `style: format dashboard layout` |
| **refactor:**| Rewriting code without altering behavior                               | `refactor: simplify auth logic` |
| **perf:**    | Performance improvements                                               | `perf: optimize database queries` |
| **test:**    | Adding or updating tests only                                          | `test: add unit tests for auth` |
| **build:**   | Changes to build system, dependencies, or CI pipelines                 | `build: update next.js to v14` |
| **ci:**      | CI configuration or scripts                                            | `ci: add github actions workflow` |
| **chore:**   | Maintenance tasks (e.g., cleaning files, bumps), no production code    | `chore: clean up unused imports` |
| **revert:**  | Reverts a previous commit                                              | `revert: undo feature X` |

---

## 🌍 Environment Configuration (Convex)

We use **Convex environment variables** to control which features show up in different environments (development, staging, production).

### What This Does

- **Development/Local**: Hides the onboarding modal so you can work without distractions
- **Staging**: Same as development - clean testing environment
- **Production**: Shows all features including the onboarding modal for real users

### 🚀 Quick Setup

#### Step 1: Create the Convex Config File

Create a new file: `convex/config.ts`

```typescript
import { query } from "./_generated/server";

export const getEnvironment = query({
  args: {},
  handler: async (ctx) => {
    // Get environment from Convex environment variable
    // Defaults to "production" if APP_ENV is not set
    const env = process.env.APP_ENV || "production";
    return env as "production" | "staging" | "development";
  },
});
```

#### Step 2: Set Your Environment Variable

Open your terminal and run one of these commands:

**For Local Development** (this is what you'll use most of the time):
```bash
npx convex env set APP_ENV development
```

**For Staging** (if your team has a staging environment):
```bash
npx convex env set APP_ENV staging --prod
```

**For Production** (live site):
```bash
npx convex env set APP_ENV production --prod
```

#### Step 3: Verify It's Working

1. Save your changes and restart your dev server
2. The onboarding modal should now be hidden in development
3. Check the Convex dashboard to confirm the variable is set

### 🤔 Common Questions

**Q: Do I need to set this every time I work on the project?**  
A: Nope! Once you set it, it stays until you change it.

**Q: What if I forget to set it?**  
A: No worries! It defaults to "production" mode, so everything will still work.

**Q: How do I check what environment I'm in?**  
A: Run `npx convex env list` to see all your environment variables.

---

## 🛠️ Developer Automation (Optional)

To streamline moving code from `ppdo-next` to `ppdo-staging` without manually deleting and copying folders, you can use the `push-staging` PowerShell command.

### What This Script Does

* **Smart Sync**: Wipes the `ppdo-staging` folder but preserves `.git` (history), `.env*` (configs), and `node_modules` (dependencies).
* **Automatic Copy**: Transfers all new code from `ppdo-next`.
* **Dependency Check**: Automatically runs `npm install` in the staging folder if `package.json` changed.
* **Git Remote Configuration**: Automatically configures the correct remote URL and branch.
* **Review Before Push**: Shows you a summary of changes and asks for confirmation before pushing.
* **Git Integration**: Captures the last commit message from `ppdo-next` and automatically commits/pushes to the staging repository.
* **Execution Logs**: Displays success/error messages and a timer showing how long the sync took.

### ⚙️ How to Setup

#### Step 1: Open PowerShell Profile

1. Open PowerShell and type: `notepad $PROFILE`
2. If you get a message that the file doesn't exist, click **Yes** to create it

#### Step 2: Add the Function

Paste the following function into the Notepad file:

```powershell
function push-staging {
    # 1. Configuration
    $rootPath    = "C:\ppdo"
    $stagingPath = "$rootPath\ppdo-staging"
    $sourcePath  = "$rootPath\ppdo-next"
    $protectedItems = @(".git", "node_modules")
    $remoteUrl = "https://github.com/mviner000/ppdo-staging.git"
    $targetBranch = "main"
    $sw = [System.Diagnostics.Stopwatch]::StartNew()
    Write-Host "`n--- Starting Sync & Deploy: next -> staging ---" -ForegroundColor Cyan
    if (!(Test-Path $stagingPath) -or !(Test-Path $sourcePath)) {
        Write-Host "ERROR: Folder paths not found." -ForegroundColor Red
        Write-Host "Expected paths:" -ForegroundColor Yellow
        Write-Host "  Source: $sourcePath" -ForegroundColor Gray
        Write-Host "  Staging: $stagingPath" -ForegroundColor Gray
        return
    }
    try {
        # --- STEP 1: CAPTURE COLLEAGUE'S MESSAGE ---
        Write-Host "Step 1: Capturing last commit message from next..." -ForegroundColor Yellow
        Set-Location $sourcePath
        
        # Capture as string and trim whitespace
        $lastMessage = (git log -1 --pretty=%B 2>&1 | Out-String).Trim()
        
        # Check if message is empty or git command failed
        if ([string]::IsNullOrWhiteSpace($lastMessage) -or $LASTEXITCODE -ne 0) {
            throw "Could not capture git message from ppdo-next."
        }
        
        Write-Host "Captured Message: '$($lastMessage.Split("`n")[0])...'" -ForegroundColor Gray
        
        # --- STEP 2: CLEANING STAGING ---
        Write-Host "Step 2: Cleaning staging (preserving .git/modules)..." -ForegroundColor Yellow
        $itemsToDelete = Get-ChildItem -Path $stagingPath -Force | Where-Object {
            $name = $_.Name
            ($protectedItems -notcontains $name) -and ($name -notlike ".env*")
        }
        $itemsToDelete | ForEach-Object {
            Remove-Item -LiteralPath $_.FullName -Recurse -Force -ErrorAction Stop
        }
        
        # --- STEP 3: COPYING FILES ---
        Write-Host "Step 3: Copying updated files..." -ForegroundColor Yellow
        $itemsToCopy = Get-ChildItem -Path $sourcePath -Force | Where-Object {
            $name = $_.Name
            ($protectedItems -notcontains $name) -and ($name -notlike ".env*")
        }
        $itemsToCopy | ForEach-Object {
            Copy-Item -LiteralPath $_.FullName -Destination $stagingPath -Recurse -Force -ErrorAction Stop
        }
        
        # --- STEP 4: NPM INSTALL ---
        Set-Location $stagingPath
        if (Test-Path "package.json") {
            Write-Host "Step 4: Running 'npm install'..." -ForegroundColor Yellow
            cmd /c "npm install"
            if ($LASTEXITCODE -ne 0) { throw "npm install failed." }
        }
        
        # --- STEP 5: CONFIGURE GIT REMOTE & BRANCH ---
        Write-Host "Step 5: Configuring git remote and branch..." -ForegroundColor Yellow
        
        # Check if origin exists
        $remoteExists = git remote get-url origin 2>$null
        
        if ($remoteExists) {
            # Update existing remote
            git remote set-url origin $remoteUrl
            Write-Host "Remote 'origin' updated to: $remoteUrl" -ForegroundColor Gray
        } else {
            # Add new remote
            git remote add origin $remoteUrl
            Write-Host "Remote 'origin' added: $remoteUrl" -ForegroundColor Gray
        }
        
        # Ensure we're on the correct branch
        $currentBranch = git branch --show-current
        if ($currentBranch -ne $targetBranch) {
            # Check if main branch exists
            $branchExists = git rev-parse --verify $targetBranch 2>$null
            if ($branchExists) {
                # Switch to existing main branch
                git checkout $targetBranch
                Write-Host "Switched to existing branch: $targetBranch" -ForegroundColor Gray
            } else {
                # Create and switch to new main branch
                git checkout -b $targetBranch
                Write-Host "Created and switched to new branch: $targetBranch" -ForegroundColor Gray
            }
        } else {
            Write-Host "Already on branch: $targetBranch" -ForegroundColor Gray
        }
        
        # --- STEP 6: GIT STATUS & REVIEW ---
        Write-Host "`nStep 6: Reviewing changes to be committed..." -ForegroundColor Yellow
        git add .
        
        # Show git status
        Write-Host "`n=== GIT STATUS ===" -ForegroundColor Cyan
        git status --short
        
        # Show commit summary
        Write-Host "`n=== COMMIT SUMMARY ===" -ForegroundColor Cyan
        Write-Host "Branch: $targetBranch" -ForegroundColor White
        Write-Host "Remote: $remoteUrl" -ForegroundColor White
        Write-Host "Commit Message: $lastMessage" -ForegroundColor White
        
        # Count changes
        $statusOutput = git status --short
        if ($statusOutput) {
            $fileCount = ($statusOutput | Measure-Object).Count
            Write-Host "Files Changed: $fileCount" -ForegroundColor White
        } else {
            Write-Host "Files Changed: 0 (No changes detected)" -ForegroundColor Gray
        }
        
        # --- STEP 7: CONFIRMATION PROMPT ---
        Write-Host "`n=== CONFIRMATION ===" -ForegroundColor Yellow
        Write-Host "Ready to commit and push to staging repository." -ForegroundColor White
        $confirmation = Read-Host "Proceed with push? (Y/N)"
        
        if ($confirmation -ne 'Y' -and $confirmation -ne 'y') {
            Write-Host "`nPush cancelled by user." -ForegroundColor Yellow
            $sw.Stop()
            Write-Host "Time: $($sw.Elapsed.TotalSeconds.ToString('N2'))s" -ForegroundColor Cyan
            return
        }
        
        # --- STEP 8: GIT COMMIT & PUSH ---
        Write-Host "`nStep 7: Committing and Pushing to staging..." -ForegroundColor Yellow
        
        # We use the captured message exactly as it was
        git commit -m "$lastMessage"
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Pushing to origin/$targetBranch..." -ForegroundColor Yellow
            
            # Set upstream and push to main
            git push --set-upstream origin $targetBranch
            
            if ($LASTEXITCODE -ne 0) { throw "git push failed." }
            Write-Host "Success: Code pushed to staging repository on $targetBranch branch." -ForegroundColor Green
        } else {
            Write-Host "Note: No changes detected to commit." -ForegroundColor Gray
        }
        
        $sw.Stop()
        Write-Host "`nTOTAL SUCCESS: Sync, Install, and Push complete!" -ForegroundColor Green
        Write-Host "Time: $($sw.Elapsed.TotalSeconds.ToString('N2'))s" -ForegroundColor Cyan
        
    } catch {
        $sw.Stop()
        Write-Host "`nFATAL ERROR: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "Process halted." -ForegroundColor DarkRed
    }
}
```

#### Step 3: Save and Reload

1. Save the file and close Notepad (Ctrl+S, then close)
2. Restart PowerShell **OR** run this command to reload your profile:

```powershell
. $PROFILE
```

### 📁 Required Folder Structure

Make sure your folders are organized like this:

```
C:\ppdo\
├── ppdo-next\      (development branch)
└── ppdo-staging\   (staging branch)
```

### ⚡ How to Use

Simply type the command from anywhere in your terminal:

```powershell
push-staging
```

The script will:
1. Capture the last commit message from `ppdo-next`
2. Clean the staging folder (keeping `.git`, `node_modules`, and `.env*` files)
3. Copy all updated files from `ppdo-next`
4. Run `npm install` if needed
5. Configure git remote and branch
6. Show you a summary of changes
7. Ask for confirmation before pushing
8. Commit and push to the staging repository

### 🔧 Troubleshooting

**Error: "Folder paths not found"**
- Make sure you have both `C:\ppdo\ppdo-next` and `C:\ppdo\ppdo-staging` folders
- The script will show you which paths it's looking for

**Error: "Could not capture git message"**
- Make sure you have at least one commit in your `ppdo-next` repository
- Navigate to `ppdo-next` and run `git log` to verify commits exist