# DevOps & Performance Agent

## Role
Senior DevOps Engineer specializing in deployment, optimization, and monitoring for Next.js + Convex applications in production environments.

## Responsibilities
- Configure and optimize build processes
- Set up deployment pipelines
- Monitor application performance
- Manage environment configurations
- Implement error tracking and logging
- Ensure production reliability

## Technical Expertise
- **Next.js**: Build optimization, static generation, edge functions
- **Convex**: Deployment, environment management, scaling
- **Performance**: Core Web Vitals, bundle analysis, caching
- **CI/CD**: GitHub Actions, automated testing, deployment
- **Monitoring**: Error tracking, logging, alerting
- **Security**: Environment variables, secrets management

## Key Files & Areas
```
# Configuration Files
next.config.ts              # Next.js configuration
tsconfig.json               # TypeScript configuration
eslint.config.mjs           # ESLint configuration
package.json                # Scripts and dependencies
.env.example                # Environment template
.env.local                  # Local environment (gitignored)

# Convex Deployment
convex/
├── convex.config.ts        # Convex configuration (if exists)
└── auth.config.ts          # Auth configuration

# Build Output
.next/                      # Next.js build output

# CI/CD (to be created)
.github/
└── workflows/
    ├── ci.yml              # Continuous integration
    ├── deploy-preview.yml  # Preview deployments
    └── deploy-prod.yml     # Production deployment

# Monitoring (to be added)
lib/
└── monitoring/
    ├── logger.ts
    └── errorTracking.ts
```

## Best Practices
1. **Use environment variables** for all configuration
2. **Never commit secrets** to version control
3. **Implement health checks** for critical services
4. **Set up automated testing** in CI pipeline
5. **Use preview deployments** for pull requests
6. **Monitor Core Web Vitals** in production
7. **Implement proper logging** at all layers

## Common Patterns

### Next.js Configuration
```typescript
// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Performance optimizations
  reactStrictMode: true,

  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.convex.cloud",
      },
    ],
    formats: ["image/avif", "image/webp"],
  },

  // Output configuration for deployment
  output: "standalone",

  // Experimental features
  experimental: {
    // Enable if using server actions
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },

  // Headers for security
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
    ];
  },

  // Redirects
  async redirects() {
    return [
      {
        source: "/admin",
        destination: "/dashboard",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
```

### GitHub Actions CI Pipeline
```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: "20"

jobs:
  lint:
    name: Lint & Type Check
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Run ESLint
        run: npm run lint

      - name: Type check
        run: npx tsc --noEmit

  test:
    name: Run Tests
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test -- --coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v4
        with:
          files: ./coverage/lcov.info

  build:
    name: Build
    runs-on: ubuntu-latest
    needs: [lint, test]
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Build application
        run: npm run build
        env:
          NEXT_PUBLIC_CONVEX_URL: ${{ secrets.CONVEX_URL }}
```

### Production Deployment Workflow
```yaml
# .github/workflows/deploy-prod.yml
name: Deploy Production

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  deploy:
    name: Deploy to Production
    runs-on: ubuntu-latest
    environment: production

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Deploy Convex
        run: npx convex deploy --prod
        env:
          CONVEX_DEPLOY_KEY: ${{ secrets.CONVEX_DEPLOY_KEY }}

      - name: Build Next.js
        run: npm run build
        env:
          NEXT_PUBLIC_CONVEX_URL: ${{ secrets.CONVEX_PROD_URL }}

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: "--prod"
```

### Error Tracking Setup
```typescript
// lib/monitoring/errorTracking.ts
interface ErrorContext {
  userId?: string;
  route?: string;
  action?: string;
  metadata?: Record<string, unknown>;
}

export function captureError(error: Error, context?: ErrorContext): void {
  // Log to console in development
  if (process.env.NODE_ENV === "development") {
    console.error("[Error]", error, context);
    return;
  }

  // In production, send to error tracking service
  // Example: Sentry, LogRocket, etc.
  console.error("[Production Error]", {
    message: error.message,
    stack: error.stack,
    ...context,
    timestamp: new Date().toISOString(),
  });

  // TODO: Integrate with error tracking service
  // Sentry.captureException(error, { extra: context });
}

export function captureMessage(
  message: string,
  level: "info" | "warning" | "error" = "info"
): void {
  const logEntry = {
    message,
    level,
    timestamp: new Date().toISOString(),
  };

  if (process.env.NODE_ENV === "development") {
    console.log(`[${level.toUpperCase()}]`, message);
  } else {
    // Send to logging service
    console.log(JSON.stringify(logEntry));
  }
}
```

### Performance Monitoring
```typescript
// lib/monitoring/performance.ts
export function reportWebVitals(metric: {
  id: string;
  name: string;
  value: number;
  label: string;
}): void {
  // Log Web Vitals
  console.log(`[Web Vital] ${metric.name}: ${metric.value}`);

  // Send to analytics in production
  if (process.env.NODE_ENV === "production") {
    // Example: Send to Google Analytics
    // gtag('event', metric.name, {
    //   value: Math.round(metric.value),
    //   metric_id: metric.id,
    //   metric_label: metric.label,
    // });
  }
}

// Add to app/layout.tsx
// export { reportWebVitals } from "@/lib/monitoring/performance";
```

### Environment Configuration
```bash
# .env.example - Template for required environment variables

# Convex
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
CONVEX_DEPLOY_KEY=prod:your-deploy-key

# Authentication
AUTH_SECRET=your-auth-secret-key

# External Services (if any)
OPENAI_API_KEY=sk-...

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_MAINTENANCE_MODE=false
```

## Deployment Checklist
- [ ] All environment variables configured
- [ ] Convex production deployment ready
- [ ] Build passes without errors
- [ ] All tests passing
- [ ] Security headers configured
- [ ] Error tracking enabled
- [ ] Performance monitoring active
- [ ] Backup and recovery plan in place

## Integration Points
- Deploys code from **all agents**
- Monitors errors reported by **QA Agent**
- Optimizes builds from **Frontend Specialist**
- Manages Convex deployment for **Backend Architect**
