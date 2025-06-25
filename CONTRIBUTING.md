# Contributing to Ship Simulator

Thank you for your interest in contributing to Ship Simulator! We welcome all contributions, whether it's bug reports, feature requests, documentation improvements, or code contributions.

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## How to Contribute

1. **Fork the repository** on GitHub
2. **Clone your fork** to your local machine
   ```bash
   git clone https://github.com/your-username/ship-simulator.git
   cd ship-simulator
   ```
3. **Create a new branch** for your changes
   ```bash
   git checkout -b your-feature-branch
   ```
4. **Install dependencies**
   ```bash
   pnpm install
   ```
5. **Make your changes**
6. **Run tests** (if available)
   ```bash
   pnpm test
   ```
7. **Lint your code**
   ```bash
   pnpm lint
   ```
8. **Commit your changes**
   ```bash
   git add .
   git commit -m "Your detailed description of your changes"
   ```
9. **Push to your fork**
   ```bash
   git push origin your-feature-branch
   ```
10. **Open a Pull Request** from your fork to the main repository

## Development Setup

### Prerequisites

- Node.js (v16 or later)
- pnpm (recommended) or npm

### Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm lint` - Lint code
- `pnpm preview` - Preview production build locally

## Reporting Issues

When reporting issues, please include:

- A clear title and description
- Steps to reproduce the issue
- Expected vs actual behavior
- Browser/OS version if relevant
- Any error messages or screenshots

## Feature Requests

We welcome feature requests! Please open an issue to discuss your idea before implementing it.

## Pull Request Process

1. Ensure any install or build dependencies are removed before the end of the layer when doing a build.
2. Update the README.md with details of changes to the interface, including new environment variables, exposed ports, useful file locations, and container parameters.
3. Increase the version numbers in any examples files and the README.md to the new version that this Pull Request would represent. The versioning scheme we use is [SemVer](http://semver.org/).
4. You may merge the Pull Request in once you have the sign-off of two other developers, or if you do not have permission to do that, you may request the second reviewer to merge it for you.

## Style Guide

- Follow the existing code style
- Use TypeScript types where possible
- Write meaningful commit messages
- Keep PRs focused on a single feature or fix
- Add tests for new features when possible
