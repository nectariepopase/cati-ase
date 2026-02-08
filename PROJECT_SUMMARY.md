# CATI Survey Application - Project Summary

## Overview

A web application designed to assist CATI operators (Alexandra and Nectarie) in conducting phone surveys about accounting costs for Romanian companies. The system provides a streamlined interface for recording survey responses in real-time during phone calls.

## Features Implemented

### 1. Authentication System
- Hardcoded login for two operators: `alexandra` and `nectarie`
- Password: `1234` for both users
- No backend authentication required
- Session-based user state management with React Context

### 2. Company Lookup via CUI
- Integration with ANAF OpenAPI for company data retrieval
- Automatic extraction of:
  - Company name
  - Location (city/town)
  - County (județ)
  - Primary CAEN code
- Fallback to alternative API if primary lookup fails
- User-friendly error handling

### 3. Survey Form with 7 Questions

#### Question 1: Administrator Verification
- Yes/No confirmation
- Survey ends if respondent is not an administrator

#### Question 2: Accounting Expense Percentage
- Multiple choice: 0-10%, 11-30%, 31-50%, 51-70%, 71-100%, Open answer
- Button-based selection for quick input

#### Question 3: Impediment Score (1-5)
- Scale rating for accountant requirement as business impediment
- Visual scale with labels

#### Question 4: Legal Obligation Justification (1-5)
- Scale rating for perceived justification of legal requirements
- Visual scale with labels

#### Question 5: Self-Accounting Capability (1-5)
- Scale rating for confidence in self-managing accounting
- Visual scale with labels

#### Question 6: Cost Influence
- Multiple choice: Very little, Little, Moderate, Much, Very much
- Button-based selection

#### Question 7: Monthly Accounting Fee
- Free text input for flexible response format
- Accepts various formats (e.g., "300 RON", "250-300 RON")

### 4. Data Submission
- Automatic submission to Supabase database
- No RLS policies (as requested)
- Success notification with company name
- Automatic form reset for next survey

### 5. User Interface
- Clean, modern design with Tailwind CSS
- Mobile-responsive layout
- Clear visual hierarchy
- Large, accessible buttons for quick selection during phone calls
- Real-time validation feedback

## Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Form Management**: React Hook Form
- **Validation**: Zod
- **API Integration**: ANAF OpenAPI

## Project Structure

```
cati-ase/
├── app/
│   ├── layout.tsx          # Root layout with AuthProvider
│   ├── page.tsx            # Main page with conditional rendering
│   └── globals.css         # Global styles
├── components/
│   ├── cui-lookup.tsx      # CUI search component
│   ├── login-form.tsx      # Login interface
│   ├── survey-dashboard.tsx # Main dashboard after login
│   └── survey-form.tsx     # Survey form with all questions
├── lib/
│   ├── anaf-api.ts         # ANAF API integration
│   ├── auth-context.tsx    # Authentication context
│   ├── supabase.ts         # Supabase client configuration
│   └── validation.ts       # Zod schemas
├── database-schema.sql     # Database setup script
├── DATABASE_SETUP.md       # Database setup instructions
├── OPERATOR_GUIDE.md       # User guide for operators
└── README.md               # Project documentation
```

## Database Schema

Table: `survey_responses`

| Field | Type | Description |
|-------|------|-------------|
| id | BIGSERIAL | Auto-increment primary key |
| cui | TEXT | Company fiscal ID |
| nume_firma | TEXT | Company name |
| localitate | TEXT | City/Town |
| judet | TEXT | County |
| cod_caen | TEXT | Primary CAEN code |
| este_administrator | BOOLEAN | Administrator confirmation |
| procent_cheltuieli_contabil | TEXT | Accounting expense percentage |
| impediment_contabil_score | INTEGER | Impediment score (1-5) |
| justificare_obligativitate_score | INTEGER | Justification score (1-5) |
| capabil_contabilitate_proprie_score | INTEGER | Self-capability score (1-5) |
| influenta_costuri_contabilitate | TEXT | Cost influence level |
| suma_lunara_contabilitate | TEXT | Monthly accounting fee |
| operator | TEXT | Operator name (alexandra/nectarie) |
| created_at | TIMESTAMP | Survey submission time |

## Setup Instructions

### 1. Database Setup
1. Access Supabase dashboard
2. Run the SQL script from `database-schema.sql`
3. Verify table creation

See `DATABASE_SETUP.md` for detailed instructions.

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables
Already configured in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 4. Run Development Server
```bash
npm run dev
```

Access at: http://localhost:3000

## Operator Workflow

1. **Login** with username (alexandra/nectarie) and password (1234)
2. **Enter CUI** of the company being surveyed
3. **Verify administrator** status (Question 1)
4. **Complete questions 2-7** by clicking buttons or entering text
5. **Submit survey** when all questions are answered
6. **View success notification** with company name
7. **Start new survey** by clicking "Sondaj Nou"

See `OPERATOR_GUIDE.md` for complete operator instructions.

## Security Considerations

⚠️ **Important**: This application is built for development/internal use:
- Hardcoded credentials (not for production)
- No RLS policies in Supabase (as requested)
- Anonymous key with full access
- No input sanitization for stored data
- No rate limiting

For production deployment, implement:
- Proper authentication (JWT, OAuth)
- Row Level Security policies
- Input sanitization
- Rate limiting
- HTTPS enforcement
- Environment variable security

## Future Enhancements

Potential improvements:
- Export survey data to Excel/CSV
- Real-time statistics dashboard
- Survey history view
- Operator performance metrics
- Multi-language support
- Voice recording integration
- Automatic CUI validation
- Duplicate response detection
- Advanced filtering and search

## Development Notes

### Code Style
- Uses tabs for indentation
- Single quotes for strings
- Semicolon-free (except where required)
- TypeScript strict mode enabled
- Functional components with hooks
- PascalCase for components
- camelCase for functions/variables
- kebab-case for file names

### Performance Optimizations
- Server Components by default
- Client Components only where needed ('use client' directive)
- Optimized imports
- No unnecessary re-renders
- Efficient state management

## Support

For technical issues or questions:
1. Check the console for error messages
2. Verify Supabase connection
3. Ensure environment variables are set correctly
4. Check ANAF API availability

## License

Internal use only.
