# CATI Survey Application

A web application designed to assist CATI operators (Alexandra and Nectarie) in conducting phone surveys about accounting costs for Romanian companies.

## Quick Start

### 1. Database Setup

See [DATABASE_SETUP.md](./DATABASE_SETUP.md) for detailed instructions.

Quick version:
1. Go to your Supabase dashboard
2. Open SQL Editor
3. Run the script from `database-schema.sql`

### 2. Install Dependencies

```bash
npm install
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Login Credentials

- **User 1**: `alexandra` / `1234`
- **User 2**: `nectarie` / `1234`

## Documentation

- **[PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)** - Complete project overview and technical details
- **[DATABASE_SETUP.md](./DATABASE_SETUP.md)** - Step-by-step database setup guide
- **[OPERATOR_GUIDE.md](./OPERATOR_GUIDE.md)** - User guide for CATI operators

## Key Features

✅ **Hardcoded Authentication** - Simple login for Alexandra and Nectarie  
✅ **CUI Lookup** - Automatic company data retrieval from ANAF  
✅ **7-Question Survey** - Comprehensive questionnaire about accounting costs  
✅ **Real-time Validation** - Form validation with instant feedback  
✅ **Supabase Integration** - Automatic data storage (no RLS)  
✅ **Success Notifications** - Clear feedback after submission  
✅ **Auto-reset Forms** - Quick workflow for consecutive surveys  

## Survey Questions

1. **Administrator Verification** - Yes/No confirmation
2. **Expense Percentage** - 10 intervals (0-10%, 10-20%, ..., 90-100%)
3. **Impediment Score** - Scale 1-5 (accountant as business barrier)
4. **Justification Score** - Scale 1-5 (legal requirement justification)
5. **Self-capability Score** - Scale 1-5 (confidence in self-accounting)
6. **Cost Influence** - Scale 1-5 (1 = Not at all, 5 = Very much)
7. **Monthly Fee** - 11 intervals (0-100, 100-200, ..., 900-1000, 1000+ RON)

## Technology Stack

- **Next.js 14** (App Router)
- **TypeScript** (Strict mode)
- **Tailwind CSS** (Mobile-first responsive design)
- **Supabase** (PostgreSQL database)
- **React Hook Form** (Form management)
- **Zod** (Schema validation)
- **ANAF OpenAPI** (Company data lookup)

## Project Structure

```
cati-ase/
├── app/                    # Next.js App Router pages
├── components/             # React components
├── lib/                    # Utilities and configurations
├── database-schema.sql     # Database setup script
├── DATABASE_SETUP.md       # Database guide
├── OPERATOR_GUIDE.md       # Operator manual
└── PROJECT_SUMMARY.md      # Technical documentation
```

## Development

The application follows modern web development best practices:
- Functional components with TypeScript
- Type-safe validation with Zod
- Responsive design with Tailwind
- Server Components by default
- Client Components only where needed

## Security Notice

⚠️ **This application is designed for internal/development use only.**

- Hardcoded credentials
- No RLS policies in Supabase
- No production-grade security features

For production deployment, implement proper authentication, authorization, and security measures.
