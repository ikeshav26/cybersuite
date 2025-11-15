# SecureGuard - Frontend Application

This is the main frontend application for the Unified Cybersecurity Platform built with Next.js 14, React 18, and TypeScript.

## Features

- 🎨 Modern UI with Tailwind CSS and shadcn/ui
- 🔐 Authentication and authorization
- 📊 Dashboard with security insights
- 🛡️ Git repository scanner interface
- 🔒 Secrets vault management
- 🤖 AI security assistant integration
- 📝 Log monitoring and alerts
- 📱 Responsive design

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **UI Library:** React 18
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Components:** Radix UI + shadcn/ui
- **State Management:** Zustand
- **Data Fetching:** TanStack Query (React Query)
- **Forms:** React Hook Form + Zod
- **Icons:** Lucide React

## Getting Started

1. Install dependencies:
```bash
pnpm install
```

2. Set up environment variables:
```bash
cp .env.local.example .env.local
```

3. Run the development server:
```bash
pnpm dev
```

Open [http://localhost:3010](http://localhost:3010) with your browser to see the result.

## Project Structure

```
apps/web/
├── src/
│   ├── app/              # Next.js app router pages
│   ├── components/       # React components
│   │   ├── ui/          # shadcn/ui components
│   │   ├── layout/      # Layout components
│   │   └── features/    # Feature-specific components
│   ├── lib/             # Utilities and configurations
│   ├── hooks/           # Custom React hooks
│   ├── stores/          # Zustand stores
│   ├── services/        # API service clients
│   └── types/           # TypeScript type definitions
└── public/              # Static assets
```

## Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm check-types` - Run TypeScript type checking
