# File Structure and Purposes

## Root Directory Files

### Configuration Files
- **`.env.local`** - Environment variables (Supabase URL and API key)
- **`.gitignore`** - Git ignore patterns
- **`eslint.config.mjs`** - ESLint configuration
- **`next.config.ts`** - Next.js configuration
- **`postcss.config.mjs`** - PostCSS configuration for Tailwind
- **`tsconfig.json`** - TypeScript configuration
- **`package.json`** - Project dependencies and scripts
- **`package-lock.json`** - Locked dependency versions

### Documentation Files
- **`README.md`** - Main project documentation and quick start guide
- **`PROJECT_SUMMARY.md`** - Comprehensive project overview and technical details
- **`DATABASE_SETUP.md`** - Step-by-step database setup instructions
- **`OPERATOR_GUIDE.md`** - Complete user guide for CATI operators
- **`DEPLOYMENT.md`** - Deployment notes and production considerations
- **`QUICK_REFERENCE.md`** - Quick reference card for operators
- **`database-schema.sql`** - SQL script to create database tables

## Application Structure

### `/app` - Next.js App Router
Main application pages and layouts following Next.js 14 App Router conventions.

- **`layout.tsx`** - Root layout component
  - Wraps entire application
  - Provides AuthProvider context
  - Sets up fonts and metadata
  - Language set to Romanian

- **`page.tsx`** - Home/main page
  - Conditional rendering based on auth state
  - Shows LoginForm when not authenticated
  - Shows SurveyDashboard when authenticated

- **`globals.css`** - Global CSS styles
  - Tailwind directives
  - Custom CSS variables
  - Base styles

- **`favicon.ico`** - Browser favicon

### `/components` - React Components
Reusable UI components for the application.

- **`login-form.tsx`** - Login interface component
  - Username and password inputs
  - Error handling
  - Form submission
  - Responsive design

- **`cui-lookup.tsx`** - Company CUI lookup component
  - CUI input field
  - Search button
  - Loading states
  - Error messages
  - Calls ANAF API

- **`survey-form.tsx`** - Main survey form component
  - All 7 survey questions
  - Button-based inputs for quick selection
  - Text input for monetary amounts
  - Form validation
  - Conditional rendering (shows Q1 first)
  - Submit functionality

- **`survey-dashboard.tsx`** - Main dashboard after login
  - Header with operator name
  - Logout button
  - Success notifications
  - Manages form state
  - Handles Supabase submission
  - Coordinates CUILookup and SurveyForm

### `/lib` - Utilities and Configuration
Helper functions, API integrations, and shared logic.

- **`auth-context.tsx`** - Authentication context provider
  - React Context for auth state
  - Login/logout functions
  - Hardcoded user validation
  - Type definitions for User

- **`supabase.ts`** - Supabase client configuration
  - Creates Supabase client instance
  - Exports configured client
  - Type definitions for SurveyResponse

- **`anaf-api.ts`** - ANAF API integration
  - Fetches company data by CUI
  - Handles API errors
  - Fallback to alternative API
  - Extracts location and county from address
  - Type definitions for CompanyData

- **`validation.ts`** - Zod validation schemas
  - Survey form validation schema
  - Type inference for form data
  - Field-level validation rules

### `/public` - Static Assets
Static files served directly by Next.js.

- **`next.svg`** - Next.js logo
- **`vercel.svg`** - Vercel logo
- **Various SVG icons** - UI icons

## Component Hierarchy

```
App (layout.tsx)
└── AuthProvider
    └── Page (page.tsx)
        ├── LoginForm (when not authenticated)
        │   ├── Username input
        │   ├── Password input
        │   └── Submit button
        │
        └── SurveyDashboard (when authenticated)
            ├── Header
            │   ├── Title
            │   ├── Operator name
            │   └── Logout button
            │
            ├── Success notification (conditional)
            │   ├── Success message
            │   └── New survey button
            │
            ├── CUILookup (when no company selected)
            │   ├── CUI input
            │   └── Search button
            │
            └── SurveyForm (when company selected)
                ├── Company info display
                ├── Question 1 (Administrator check)
                └── Questions 2-7 (conditional on Q1 = Yes)
                    ├── Q2: Percentage buttons
                    ├── Q3: Score buttons (1-5)
                    ├── Q4: Score buttons (1-5)
                    ├── Q5: Score buttons (1-5)
                    ├── Q6: Multiple choice buttons
                    ├── Q7: Text input
                    └── Submit button
```

## Data Flow

1. **Authentication Flow**
   ```
   User enters credentials
   → LoginForm validates
   → auth-context updates state
   → Page re-renders with SurveyDashboard
   ```

2. **CUI Lookup Flow**
   ```
   Operator enters CUI
   → CUILookup calls anaf-api
   → API fetches company data
   → Company data passed to parent
   → SurveyDashboard shows SurveyForm
   ```

3. **Survey Submission Flow**
   ```
   Operator answers questions
   → Form validates with Zod
   → SurveyForm calls onSubmit
   → SurveyDashboard submits to Supabase
   → Success notification displayed
   → Form resets for next survey
   ```

## Key Design Decisions

### 1. Hardcoded Authentication
- **Why**: Simplicity for internal use
- **Trade-off**: Not scalable, not secure for production
- **Location**: `lib/auth-context.tsx`

### 2. No RLS in Database
- **Why**: Explicitly requested by user
- **Trade-off**: Full access with anon key
- **Location**: `database-schema.sql`

### 3. Button-Based Form Inputs
- **Why**: Speed for phone operators
- **Trade-off**: More screen space required
- **Location**: `components/survey-form.tsx`

### 4. Client Components Where Needed
- **Why**: Interactive elements require client-side JS
- **Trade-off**: More JavaScript sent to browser
- **Files**: All components (use 'use client' directive)

### 5. Single-Page Application
- **Why**: Simplicity, no navigation needed
- **Trade-off**: Limited scalability
- **Location**: `app/page.tsx`

## Environment Variables

Required in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://kdwebmvgpglmixbtkbqz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
```

Both variables use `NEXT_PUBLIC_` prefix to make them available in browser.

## Dependencies

### Production Dependencies
- `next` - React framework
- `react` - UI library
- `react-dom` - React DOM renderer
- `@supabase/supabase-js` - Supabase client
- `zod` - Schema validation
- `react-hook-form` - Form management
- `@hookform/resolvers` - Form validation integration

### Development Dependencies
- `typescript` - Type safety
- `@types/*` - Type definitions
- `tailwindcss` - CSS framework
- `eslint` - Code linting
- `eslint-config-next` - Next.js ESLint config

## Scripts

Defined in `package.json`:

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Code Style

Following best practices as specified:
- Tabs for indentation
- Single quotes for strings
- No semicolons (except where required)
- PascalCase for components
- camelCase for functions/variables
- kebab-case for file names
- TypeScript strict mode
- Functional components
