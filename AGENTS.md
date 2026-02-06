# Backend Repository Guidelines

## Project Structure & Module Organization
- `src/index.ts` is the Express entrypoint.
- `src/routes/` holds API routes (`generate`, `chat`, `profile`).
- `src/services/` contains AI integrations, prompt engine, and output storage.
- `src/utils/` contains shared utilities (e.g., validator, code extraction).
- `src/config/` holds static config like language profiles.
- `src/types.ts` holds backend-shared types (no external shared package).
- `src/assets/` is copied to `dist/assets` during build.
- `outputs/` stores generated HTML files (see `OUTPUTS_DIR`).
- `dist/` is the build output.

## Architecture Overview
- `/api/generate` streams progress (SSE) and follows:
  `promptEngine` -> `minimax` -> `codeExtractor` -> `validator` -> `outputsStore` -> response with `htmlSha256`.
- `/api/chat` and `/api/parse-profile` use the Gemini-compatible service.

## Build, Test, and Development Commands
- Install deps: `npm install` (inside `backend/`).
- Dev server: `npm run dev` (tsx watch).
- Build: `npm run build` (esbuild bundle).
- Run built server: `npm run start`.
- Manual API smoke test: `./test-request.sh` or `node test-request.js` (writes to `test_results/`).
- Unit tests (if added): `npx vitest`.

## Coding Style & Naming Conventions
- TypeScript, 2-space indentation, semicolons, ESM imports.
- Use the `@` alias for backend-root imports (e.g., `@/src/services/gemini.js`).
- Keep explicit `.js` extensions in ESM import paths.
- Routes/utilities use lower camel case filenames.

## Environment & Configuration
- Copy `.env.example` to `.env` and set required keys (Gemini/MiniMax).
- `src/services/gemini.ts` loads `.env` relative to project root; adjust if the runtime cwd changes after extraction.
- `OUTPUTS_DIR` controls the outputs folder (default `outputs/`).

## Safety Notes
- If changing sandbox rules in `src/utils/validator.ts`, document the new allow/deny behavior.
