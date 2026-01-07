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
* **Git Integration**: Captures the last commit message from `ppdo-next` and automatically commits/pushes to the staging repository.
* **Execution Logs**: Displays success/error messages and a timer showing how long the sync took.

### ⚙️ How to Setup

1. Open PowerShell and type: `notepad $PROFILE`. (If prompted to create a new file, click Yes).
2. Paste the following function into the file:

```powershell
function push-staging {
    # 1. Configuration
    $rootPath    = "C:\Users\PrimeX Ventures Melv\Documents\primex_ventures\ppdo"
    $stagingPath = "$rootPath\ppdo-staging"
    $sourcePath  = "$rootPath\ppdo-next"
    $protectedItems = @(".git", "node_modules")
    $sw = [System.Diagnostics.Stopwatch]::StartNew()
    Write-Host "`n--- Starting Sync & Deploy: next -> staging ---" -ForegroundColor Cyan
    if (!(Test-Path $stagingPath) -or !(Test-Path $sourcePath)) {
        Write-Host "ERROR: Folder paths not found." -ForegroundColor Red
        return
    }
    try {
        # --- STEP 1: CAPTURE COLLEAGUE'S MESSAGE ---
        Write-Host "Step 1: Capturing last commit message from next..." -ForegroundColor Yellow
        Set-Location $sourcePath
        $lastMessage = git log -1 --pretty=%B
        if ($null -eq $lastMessage -or $lastMessage -eq "") {
            throw "Could not capture git message from ppdo-next."
        }
        Write-Host "Captured Message: '$($lastMessage.Trim().Split("`n")[0])...'" -ForegroundColor Gray
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
        # --- STEP 5: GIT DEPLOY ---
        Write-Host "Step 5: Committing and Pushing to staging..." -ForegroundColor Yellow
        git add .
        
        # We use the captured message exactly as it was
        git commit -m "$lastMessage"
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Pushing to origin..." -ForegroundColor Yellow
            git push
            if ($LASTEXITCODE -ne 0) { throw "git push failed." }
            Write-Host "Success: Code pushed to staging repository." -ForegroundColor Green
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

3. Save and close Notepad.
4. Restart PowerShell or run `. $PROFILE`.

### ⚡ How to Use

Simply type the command from anywhere in your terminal:

```powershell
push-staging
```