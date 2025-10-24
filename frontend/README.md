# erodoro - Prediction Market Frontend

A modern, pixel-perfect Next.js application for prediction markets, built with TypeScript, Tailwind CSS, and design system best practices.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS with design tokens
- **State**: Zustand
- **Icons**: Lucide React
- **Testing**: Playwright
- **Linting**: ESLint with custom rules
- **Formatting**: Prettier with Tailwind plugin

## Getting Started

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build

# Run linter
pnpm lint

# Format code
pnpm format

# Run tests
pnpm test
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Project Structure

```
src/
├── app/              # Next.js App Router
│   ├── layout.tsx    # Root layout with font loading
│   ├── page.tsx      # Homepage
│   └── globals.css   # Global styles and design tokens
├── components/
│   ├── primitives/   # Base UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── Chip.tsx
│   │   ├── Tabs.tsx
│   │   └── ...
│   ├── header/       # Header components
│   ├── market/       # Market-related components
│   ├── auth/         # Authentication components
│   └── trade/        # Trading components
└── lib/
    ├── format.ts     # Formatting utilities
    ├── types.ts      # TypeScript types
    ├── store.ts      # Zustand store
    ├── a11y.ts       # Accessibility utilities
    └── mock.ts       # Mock data
```

## Design System

### Design Tokens

All colors, shadows, and radii use design tokens from `globals.css`:

- **Colors**: bg0-bg3, bd0-bd1, txt1-txt3, blue, green, red, etc.
- **Shadows**: card, modal
- **Radii**: panel (12px), control (10px), chip (10px), modal (16px)

### No Drift Rules

- ✅ Only use tokens for colors and shadows
- ✅ Radii limited to panel, control, chip, modal
- ✅ Borders use bd0 or bd1 only
- ❌ No hardcoded hex colors
- ❌ No custom box-shadow values

### Responsive Breakpoints

- **md2**: 840px (2 columns)
- **xl2**: 1200px (3 columns)

## Features

- ✨ Pixel-perfect UI implementation
- 🎨 Dark theme with design tokens
- ♿ Full keyboard navigation and ARIA support
- 📱 Mobile-responsive with bottom drawer
- 🔍 Slash key search shortcut
- 🎯 Focus trap in modals
- 📊 Market cards with Yes/No pricing
- 💱 Trade ticket with quick amounts

## Keyboard Shortcuts

- `/` - Focus header search
- `Esc` - Close modals
- `Tab` - Navigate between interactive elements
- `Arrow keys` - Navigate chips

## Testing

Playwright tests verify:

- Header height (72px)
- Slash key focus behavior
- Active tab underline (2px blue)
- Title line-clamp
- Modal ESC close
- Focus rings visibility
- Volume formatting

## CI/CD

GitHub Actions workflow runs on push/PR:

1. Format check
2. Lint
3. Build
4. Playwright tests

## License

MIT
