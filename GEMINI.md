# Global & Project Guidelines

1. **Skill Utilization**: Always use available skills or feel free to install skills whenever needed. Use the `find-skills` skill to find skills and download them.
2. **Server Command Restriction**: Never run commands like `pnpm dev`, `npm run dev`, `pnpm preview`, or any other commands that launch background dev servers or bind local ports, as this may interfere with the user's active workflow.
3. **Documentation Precedence**: Always follow and refer to documentation in the project's `docs/` directory (`PRD.md`, `FLOW.md`, `DESIGN.md`, `PLAN.md`, etc.).
4. **Relative Path Enforcement**: Always use relative paths inside project code and import files. Never use hardcoded absolute system paths (e.g. `/home/user/...`), ensuring portability across systems.
