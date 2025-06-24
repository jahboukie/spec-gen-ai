# SpecGen AI

An AI-powered SaaS platform that converts founder ideas into comprehensive technical specifications through Socratic dialogue using Google Gemini AI.

## Quality Gauntlet & Development Workflow

This project follows strict CI/CD practices with comprehensive quality gates. **All code must pass the Quality Gauntlet before being committed.**

### Pre-Commit Quality Gates

**REQUIRED: Run before every commit:**

```bash
npm run precommit
```

This runs:
- ESLint (code quality)
- TypeScript checking (type safety)  
- Unit tests (functionality verification)

**For comprehensive testing:**

```bash
npm run quality-gate
```

This includes coverage verification (80% threshold required).

### Development Setup

1. Install dependencies:
```bash
npm install --legacy-peer-deps
```

2. Set up environment variables (copy `.env.example` to `.env.local`)

3. Initialize database:
```bash
npm run db:push
npm run db:generate
```

4. Start development server:
```bash
npm run dev
```

### CI/CD Pipeline

The Quality Gauntlet runs automatically on PRs to `main`:
- ✅ Code Quality & Linting
- ✅ TypeScript Type Checking  
- ✅ Unit Tests & Coverage (80% minimum)
- ✅ Build Verification
- ✅ Integration Tests

**Branch Protection:** Direct pushes to `main` are blocked. All changes must go through PR review and pass the Quality Gauntlet.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
