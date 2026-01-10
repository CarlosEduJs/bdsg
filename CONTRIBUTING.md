# Contributing to bdsg

Thank you for your interest in contributing to bdsg!

## Getting Started

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/your-username/bdsg.git
   cd bdsg
   ```
3. Install dependencies:
   ```bash
   bun install
   ```

## Development Workflow

### Running Tests

```bash
cd packages/bdsg
bun test
```

### Building

```bash
bun run build
```

### Linting & Formatting

```bash
bun run check
```

This runs Biome for both linting and formatting.

## Pull Request Process

1. Create a feature branch from `main`:
   ```bash
   git checkout -b feat/your-feature
   ```

2. Make your changes and ensure:
   - All tests pass (`bun test`)
   - Types are correct (`bun run check-types`)
   - Code is formatted (`bun run check`)

3. Write meaningful commit messages following [Conventional Commits](https://www.conventionalcommits.org/):
   - `feat: add new spacing algorithm`
   - `fix: correct contrast calculation`
   - `docs: update README examples`

4. Push and open a Pull Request

## Code Style

- Use TypeScript for all source files
- Use Zod for input validation
- Export types alongside functions
- Write tests for new features

## Reporting Issues

When reporting issues, please include:

- A clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- bdsg version
- Bun/Node version

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
