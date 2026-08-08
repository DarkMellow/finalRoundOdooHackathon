# Global & Project Guidelines

1. **Skill Utilization**: Always use available skills.
2. **Server Command Restriction**: Never run commands like `pnpm dev`, `npm run dev`, `pnpm preview`, or any other commands that launch background dev servers or bind local ports, as this may interfere with the user's active workflow.
3. **Documentation Precedence**: Always follow and refer to documentation in the project's `docs/` directory (`PRD.md`, `FLOW.md`, `DESIGN.md`, `PLAN.md`, etc.).
4. **Relative Path Enforcement**: Always use relative paths inside project code, import files and docs. Never use hardcoded absolute system paths (e.g. `/home/user/...`), ensuring portability across systems.
