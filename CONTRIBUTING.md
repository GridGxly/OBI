# Contributing to OBI

Thanks for your interest in contributing to OBI! Here's how to get involved.

## Getting Started

1. **Fork** the repository
2. **Clone** your fork locally
3. **Create a branch** for your work: `git checkout -b feature/your-feature-name`
4. **Make your changes** and test them
5. **Commit** with a clear message (see below)
6. **Push** to your fork and open a **Pull Request**

## Branch Naming

Use a descriptive prefix:

- `feature/` — new functionality
- `fix/` — bug fixes
- `refactor/` — code restructuring
- `docs/` — documentation updates
- `style/` — UI/styling changes

Example: `feature/clap-embeddings`, `fix/audio-player-seek`, `docs/api-endpoints`

## Commit Messages

Write clear, concise commit messages. Use the present tense and keep the subject line under 72 characters.

```
Add waveform click-to-seek functionality
Fix particle canvas memory leak on unmount
Update README with backend setup instructions
```

## Code Style

- **Frontend**: Follow the existing TypeScript + React conventions. Use functional components and hooks. Style with Tailwind utility classes.
- **Backend**: Follow PEP 8 for Python. Use type hints where possible.
- **ML**: Document any new embedding approaches or model changes clearly.

## Pull Requests

- Keep PRs focused — one feature or fix per PR
- Include a brief description of what changed and why
- Reference any related issues (e.g., `Closes #12`)
- Make sure the app builds and runs before submitting

## Reporting Bugs

If you find a bug, open an issue with:

- A clear title and description
- Steps to reproduce
- Expected vs actual behavior
- Screenshots or logs if applicable

## Feature Requests

Have an idea? Open an issue tagged as a feature request. Describe the use case and how it fits into the project.

---

Thanks for helping make OBI better!
