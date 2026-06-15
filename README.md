# League OS Frontend

Frontend application for League OS, built with React, TypeScript, Vite, and Material UI.

## Tech Stack

- React 19
- TypeScript
- Vite
- Material UI
- React Router
- Zustand
- Vitest and Testing Library

## Getting Started

Install dependencies:

```bash
npm install
```

Start the local dev server:

```bash
npm run dev
```

Run a production build:

```bash
npm run build
```

Run lint checks:

```bash
npm run lint
```

Run tests:

```bash
npm run test
```

## Project Structure

- `src/pages` - route-level pages, including auth and role-specific flows
- `src/components` - shared UI components
- `src/layouts` - reusable page layouts
- `src/services` - API and backend integration
- `src/store` - global state management
- `src/utils` - shared helper functions

## Pull Request Workflow

1. Update your local `main` branch.

```bash
git checkout main
git pull origin main
```

2. Create a new feature branch.

```bash
git checkout -b feature/auth-registration-verification
```

3. Make your changes, then stage and commit them.

```bash
git add .
git commit -m "feat(auth): add registration and email verification flow"
```

4. Push the branch to GitHub.

```bash
git push -u origin feature/auth-registration-verification
```

5. Open a pull request on GitHub.

- Set `base` to `main`
- Set `compare` to `feature/auth-registration-verification`
- Add a title and description
- Create the pull request
