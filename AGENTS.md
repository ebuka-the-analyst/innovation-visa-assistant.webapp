\# Codex Repository Safety Instructions



\## Primary rule



This is an existing production application.



Only modify functionality that the user has specifically requested and explicitly approved. Preserve everything else exactly as it currently works.



\## Default mode



All requests are inspection and planning only unless the user explicitly says:



"Proceed with the approved implementation."



Inspecting, reviewing, diagnosing, locating files, preparing a plan or describing requirements does not grant permission to edit.



\## Before editing



Before modifying anything, Codex must:



1\. Read this AGENTS.md file.

2\. Confirm the current Git branch.

3\. Confirm the working tree status.

4\. Restate the requested change.

5\. List every file it proposes to modify.

6\. List every file it proposes to create or delete.

7\. Explain the exact change planned for each file.

8\. Identify risks and affected functionality.

9\. State what will remain untouched.

10\. Stop and wait for explicit approval.



\## Git branch protection



The approved working branch is:



codex-safe-edit



If the current branch is not codex-safe-edit, stop immediately.



Do not:



\- Switch to main.

\- Edit main.

\- Merge into main.

\- Push to GitHub.

\- Create a pull request.

\- Deploy to Railway.

\- Rewrite Git history.

\- Force push.

\- Commit unless explicitly requested.



\## Strict scope control



Only modify files included in the most recently approved plan.



If another file becomes necessary:



1\. Stop.

2\. Explain why it is required.

3\. Describe the exact proposed change.

4\. Wait for approval.



Do not make additional improvements simply because they appear useful.



\## Prohibited changes without separate approval



Do not:



\- Refactor unrelated code.

\- Reformat unrelated files.

\- Rename existing files, routes, functions or components.

\- Change unrelated text, styling or responsive behaviour.

\- Change authentication or permissions.

\- Change payment behaviour.

\- Change Stripe configuration.

\- Change database schemas.

\- Create or run migrations.

\- Modify environment variables or secrets.

\- Modify Railway configuration.

\- Modify deployment or CI configuration.

\- Install, remove or upgrade packages.

\- Modify package.json or lock files.

\- Delete working functionality.

\- Replace working data with mock data.

\- Run destructive commands.

\- Commit, push, merge or deploy.



\## Minimum-change principle



Use the smallest safe change possible.



Prefer:



\- Targeted edits instead of rewriting complete files.

\- Existing project patterns instead of introducing new architecture.

\- Existing dependencies instead of adding packages.

\- Existing database infrastructure where appropriate.

\- Safe fallbacks that preserve current production behaviour.



\## Production protection



Preserve:



\- Existing routes.

\- Existing APIs.

\- Existing authentication.

\- Existing user permissions.

\- Existing database records.

\- Existing integrations.

\- Existing payment behaviour.

\- Existing public page design.

\- Existing mobile behaviour.

\- Existing SEO behaviour.

\- Existing Railway deployment configuration.



Never expose or commit credentials.



\## Testing



After an approved implementation:



1\. Run only the relevant safe existing checks.

2\. Report every command executed.

3\. Report every pass and failure.

4\. Distinguish pre-existing errors from newly introduced errors.

5\. Do not change unrelated code to fix unrelated failures.

6\. Do not run database migrations without explicit approval.



Expected checks include, where applicable:



\- npm run check

\- npm run build



There is currently no automated test command unless one is added through a separately approved task.



\## Mandatory post-edit review



After an approved implementation, run:



git status --short

git diff --name-only

git diff --stat

git diff



Report:



\- Every modified file.

\- Every created file.

\- Every deleted file.

\- The exact purpose of each change.

\- Type-check and build results.

\- Manual testing still required.

\- Remaining risks.



If a file outside the approved scope was changed, restore that unrelated change before completing the task.



\## Final rule



When uncertain, stop and ask.



Do not guess, expand the scope or implement unapproved work.

