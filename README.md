# ZPI2025_IO3_BunniHopPon

**Team members:**
- Andrii Bialkovskyi (253190) - SCRUM Master / DevOps
- Mikita Dzeviatau (253805) - Developer
- Dmytro Malinovskyi (252501) - Developer
- Yevhen Oleinichenko (252499) - Developer
- Aliaksandr Yurusau (253811) - Tester

## i. Technology of the project realization
- **Frontend Framework**: React 19
- **Build Tool**: Vite
- **Language**: JavaScript (ES6+) compiled with Babel
- **Data Visualization**: React Charts
- **Code Quality**: ESLint
- **Testing**: Jest, React Testing Library

## ii. Place of software deployment & How to run it
**Deployment Location:**
The application is automatically deployed to **GitHub Pages** whenever changes are pushed to the `release` branch. The live application can be accessed here: **[NBP Analytics](https://iis-zpi.github.io/ZPI2025_IO3_BunniHopPon/)**

**How to run locally:**
1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## iii. Location of project documentation
The project documentation is located on GitHub and can be accessed via the following link:
[Project Documentation Folder](https://github.com/IIS-ZPI/ZPI2025_IO3_BunniHopPon/tree/main/Docs)

## iv. Location of backlogs
Project backlogs (tasks and sprints) are managed and tracked on [Trello](https://trello.com/b/E2XdRPx8/zpimain) and [GitHub Issues](https://github.com/IIS-ZPI/ZPI2025_IO3_BunniHopPon/issues?q=is%3Aissue%20state%3Aclosed). Bug reports specifically are tracked in GitHub Issues and are labeled with the `"Bug"` tag.

## v. Continuous Integration (CI) & Unit Test Automation
- **CI Tool**: GitHub Actions
- **Configuration**: The CI pipeline is defined in `.github/workflows/workflow.yml`.
- **Process**:
  - The workflow triggers automatically on pushes and pull requests to the `main`, `release`, and `develop` branches.
  - It runs a series of automated jobs: setting up the Node.js environment, installing dependencies (`npm ci`), running the linter (`npm run lint`), and executing all automated unit tests (`npm test` which includes both UI and logic tests).
  - Continuous Delivery (CD) is configured for the `release` branch, automatically building the app, creating versioned GitHub Releases, and deploying to GitHub Pages.

## vi. Location of test repots
- **GitHub**: Comprehensive testing reports are uploaded and available on the project's [GitHub](https://github.com/IIS-ZPI/ZPI2025_IO3_BunniHopPon/tree/main/Docs/test%20reports).
- **Local Test Reports**: Running the test coverage script (`npm run test:cov`) generates comprehensive reports in the local `coverage/` directory.
- **CI Test Reports**: The logs and reports from automated testing procedures and linting checks are accessible in the [GitHub Actions](https://github.com/IIS-ZPI/ZPI2025_IO3_BunniHopPon/actions) tab on the repository's GitHub page.
