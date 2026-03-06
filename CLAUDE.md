# Claude Code Rules for This Project

## Git Workflow — ALWAYS follow this, no exceptions

**Always commit and push directly to `main`. Never create feature branches. Never create PRs.**

```bash
git checkout main
git pull origin main
# make changes
git add .
git commit -m "message"
git push origin main
```

- Do NOT create branches like `claude/...` or any other branch
- Do NOT open pull requests
- Do NOT use `git merge` workflows
- Every task ends with a direct push to `main`
