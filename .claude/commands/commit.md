# /commit - Commit with English and Push

This command commits changes with an English commit message and pushes to the remote repository.

## Instructions

1. **Check git status** to see what files have been modified

2. **Review changes** by showing a diff of modified files

3. **Ask the user for commit message** using AskUserQuestion:
   - Question: "What is the commit message?"
   - Provide a suggested message based on the changes
   - Format: Use conventional commits (fix:, feat:, refactor:, chore:, etc.)

4. **Stage and commit changes**:
   - Add all relevant files (exclude .claude/settings.local.json)
   - Create commit with the message in English
   - Add co-author line: "Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

5. **Push to remote**:
   - Push to origin master (or current branch)
   - If push fails due to credentials, inform user to push manually

## Example Messages

- `fix: resolve issue with X not updating`
- `feat: add new feature for Y`
- `refactor: improve Z performance`
- `chore: update dependencies`

## Notes

- Always use English for commit messages
- Follow conventional commits format
- Review changes before committing
- Handle push errors gracefully
