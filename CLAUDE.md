# Claude Code Rules for This Project

## Git Workflow

This environment cannot push to main directly due to branch protection. Always work on a branch named exactly: `phase-[number]-build`

After finishing, push the branch and summarise what was built. The developer will merge to main manually.

Always `git pull origin main` at the start of each session before branching.

```bash
git checkout main
git pull origin main
git checkout -b phase-[number]-build
# make changes
git add .
git commit -m "message"
git push origin phase-[number]-build
```
