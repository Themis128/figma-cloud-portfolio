# App Modernization Instruction

## Purpose
This instruction file provides guidelines and best practices for modernizing your application codebase. Follow these steps to ensure a smooth and maintainable modernization process.

## Steps for App Modernization

1. **Assessment**
   - Review the current architecture and dependencies.
   - Identify legacy components, outdated libraries, and technical debt.
   - Document pain points and modernization goals.

2. **Planning**
   - Define the target architecture (e.g., microservices, serverless, cloud-native).
   - Select modern frameworks, tools, and platforms.
   - Plan for incremental migration to minimize risk.

3. **Code Refactoring**
   - Refactor monolithic code into modular components.
   - Replace deprecated APIs and libraries with supported alternatives.
   - Improve code readability, maintainability, and test coverage.

4. **Cloud Readiness**
   - Containerize applications (e.g., Docker).
   - Externalize configuration and secrets.
   - Ensure statelessness for scalability.

5. **CI/CD Integration**
   - Establish automated pipelines that provide fast feedback, enforce quality gates, and deliver repeatable deployments.

   **Recommended pipeline jobs**
   - PR checks (lint, typecheck, unit tests, build) — run on every pull request.
   - Integration / E2E jobs (Playwright) — run on merge to `main`/`production` or on-demand.
   - Release jobs (artifact build, docker image push, deploy) — run on tags or protected-branch merges.
   - Security scans & dependency updates (CodeQL, Dependabot, Trivy/Snyk).

   **Quality & security gates**
   - Enforce branch protection: require passing PR checks and at least one approving review.
   - Fail PRs for lint/type errors, test regressions, or critical vulnerability findings.
   - Publish test reports, coverage (use JUnit/coverage artifacts) and fail if coverage drops below threshold (repo default: 20%).

   **Deployment strategies**
   - Use PR/preview environments for every pull request (AWS Amplify preview, Netlify, Vercel) to validate UI and backend integration.
   - Prefer canary or blue/green deployments for production with automatic rollback on errors.
   - Combine deployments with feature flags for gradual rollouts.

   **Artifacts & caching**
   - Cache `pnpm` store / node_modules, Playwright browser binaries and build caches for faster CI runs.
   - Persist artifacts (coverage, test-results, Playwright screenshots/videos) for debugging failed runs.

   **Practical GitHub Actions examples**

   - PR checks (fast feedback):
   ```yaml
   name: PR — CI
   on: [pull_request]
   jobs:
     checks:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         - uses: pnpm/action-setup@v2
           with:
             version: 8
         - name: Install
           run: pnpm install --frozen-lockfile
         - name: Lint
           run: pnpm lint
         - name: Typecheck
           run: pnpm typecheck
         - name: Unit tests
           run: pnpm test -- --reporter=dot
         - name: Build (verify)
           run: pnpm run build
   ```

   - E2E job (on main/production or manual trigger):
   ```yaml
   name: E2E
   on:
     workflow_dispatch: {}
     push:
       branches: [main, production]
   jobs:
     e2e:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         - uses: pnpm/action-setup@v2
           with: { version: 8 }
         - run: pnpm install --frozen-lockfile
         - run: pnpm run build:server && pnpm run build:client
         - name: Start servers
           run: pnpm dev:all &
         - name: Run Playwright E2E
           run: pnpm run test:e2e
         - uses: actions/upload-artifact@v4
           with:
             name: playwright-artifacts
             path: test-results
   ```

   - Release (tag → publish + optional Docker push):
   ```yaml
   name: Release
   on:
     push:
       tags: ['v*.*.*']
   jobs:
     release:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         - uses: pnpm/action-setup@v2
           with: { version: 8 }
         - run: pnpm install --frozen-lockfile
         - run: pnpm run build
         - name: Publish artifacts
           run: # deploy to Amplify/Cloud or push Docker image (project-specific)
   ```

   **Suggested `package.json` CI scripts**
   - `ci:lint`: `pnpm lint`
   - `ci:typecheck`: `pnpm typecheck`
   - `ci:test`: `pnpm test -- --ci`
   - `ci:e2e`: `pnpm run test:e2e`
   - `ci:build`: `pnpm run build`

   **Acceptance criteria for CI/CD**
   - All PRs must pass lint, typecheck, unit tests and build verification before merge.
   - E2E must pass on `main`/`production` and release pipelines must produce reproducible artifacts.
   - Security scans run automatically and high/critical findings block releases.

6. **Testing & Validation**
   - Write unit, integration, and end-to-end tests.
   - Validate functionality and performance after each modernization step.

7. **Documentation**
   - Update architecture diagrams and README files.
   - Document migration steps, known issues, and rollback procedures.

8. **Monitoring & Optimization**
   - Integrate monitoring and logging solutions.
   - Continuously optimize for performance, cost, and reliability.

## Best Practices
- Use version control for all changes.
- Prioritize automation for testing and deployment.
- Maintain backward compatibility where possible.
- Involve stakeholders in planning and review.
- Regularly review and update modernization goals.

---

*Update this file as your modernization process evolves.*
