# Run from any directory:
# powershell -NoProfile -ExecutionPolicy Bypass -File "path\to\push.ps1"
# Optional commit message: -Message "Update homepage"
# Stages ALL new, modified, and deleted files that Git does not ignore.
# Pushes the current branch to origin. Never force-pushes or auto-merges.

[CmdletBinding()]
param(
    [Alias('m')]
    [ValidateNotNullOrEmpty()]
    [string]$Message = ("Update website {0}" -f (Get-Date -Format 'yyyy-MM-dd HH:mm:ss'))
)

$ErrorActionPreference = 'Stop'
$repoDirectory = $PSScriptRoot

function Invoke-RepoGit {
    param([string[]]$GitArguments)

    & git -c core.fsmonitor=false -C $repoDirectory @GitArguments
    if ($LASTEXITCODE -ne 0) {
        throw "Git failed (exit code $LASTEXITCODE). Stopped; no force-push was attempted."
    }
}

try {
    if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
        throw 'Git was not found. Install Git for Windows and reopen your terminal.'
    }

    Invoke-RepoGit -GitArguments @('rev-parse', '--show-toplevel')

    $branchName = & git -c core.fsmonitor=false -C $repoDirectory symbolic-ref --quiet --short HEAD
    if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($branchName)) {
        throw 'No current branch (detached HEAD). Switch to a branch before running this script.'
    }

    Invoke-RepoGit -GitArguments @('remote', 'get-url', 'origin')
    Write-Host "Staging all changes on branch: $branchName"
    Invoke-RepoGit -GitArguments @('add', '--all')

    & git -c core.fsmonitor=false -C $repoDirectory diff --cached --quiet --exit-code
    $stagedDiffExitCode = $LASTEXITCODE
    if ($stagedDiffExitCode -eq 1) {
        Invoke-RepoGit -GitArguments @('commit', '-m', $Message)
    }
    elseif ($stagedDiffExitCode -eq 0) {
        Write-Host 'No file changes to commit. Pushing any existing commits.'
    }
    else {
        throw "Could not inspect staged changes (exit code $stagedDiffExitCode)."
    }

    Invoke-RepoGit -GitArguments @('push', '--set-upstream', 'origin', "HEAD:refs/heads/$branchName")
    Write-Host "Success: pushed $branchName to origin."
}
catch {
    Write-Error -Message $_.Exception.Message -ErrorAction Continue
    Write-Host 'If push was rejected, your local commit is preserved. Resolve the reported issue and run this script again.'
    exit 1
}
