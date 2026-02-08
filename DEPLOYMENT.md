# Deployment Notes

## Current Status

The application is currently running in **development mode** and is ready for use by Alexandra and Nectarie.

## Before First Use

### ⚠️ CRITICAL: Setup Database

You **MUST** run the database schema before using the application:

1. Go to https://kdwebmvgpglmixbtkbqz.supabase.co
2. Navigate to **SQL Editor**
3. Copy the entire contents of `database-schema.sql`
4. Paste and run the script
5. Verify the `survey_responses` table was created

**The application will not work without this step!**

See `DATABASE_SETUP.md` for detailed instructions with screenshots.

## Local Development

### Starting the Application

```bash
npm run dev
```

The application will be available at:
- Local: http://localhost:3000
- Network: http://192.168.1.171:3000 (accessible from other devices on your network)

### Stopping the Application

Press `Ctrl+C` in the terminal where the dev server is running.

### Restarting After Changes

If you make any code changes, the application will automatically reload (hot reload).

## Production Deployment (Optional)

If you want to deploy this application to production, here are the recommended steps:

### Option 1: Vercel (Easiest)

1. Push code to GitHub
2. Go to https://vercel.com
3. Import your GitHub repository
4. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Deploy

### Option 2: Docker (Self-hosted)

Create a `Dockerfile`:

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t cati-survey .
docker run -p 3000:3000 --env-file .env.local cati-survey
```

### Option 3: Traditional VPS

1. Install Node.js 20+ on your server
2. Clone the repository
3. Install dependencies: `npm ci`
4. Build: `npm run build`
5. Start: `npm start`
6. Use PM2 for process management:
   ```bash
   npm install -g pm2
   pm2 start npm --name "cati-survey" -- start
   pm2 save
   pm2 startup
   ```

## Security Considerations for Production

⚠️ **The current implementation is NOT production-ready**. Before deploying to production:

### 1. Authentication
- [ ] Replace hardcoded credentials with proper authentication
- [ ] Implement JWT or session-based auth
- [ ] Add password hashing (bcrypt)
- [ ] Add rate limiting for login attempts

### 2. Database Security
- [ ] Enable RLS (Row Level Security) in Supabase
- [ ] Create proper policies for data access
- [ ] Use service role key for server-side operations
- [ ] Restrict anon key permissions

### 3. API Security
- [ ] Add CORS configuration
- [ ] Implement rate limiting
- [ ] Add input validation on server-side
- [ ] Sanitize all inputs to prevent XSS

### 4. Environment Variables
- [ ] Never commit `.env.local` to version control
- [ ] Use environment-specific configs
- [ ] Rotate API keys regularly

### 5. Monitoring
- [ ] Add error tracking (e.g., Sentry)
- [ ] Implement logging
- [ ] Set up uptime monitoring
- [ ] Add analytics (optional)

## Database Maintenance

### Backing Up Data

Regular backups are recommended. In Supabase:
1. Go to **Database** → **Backups**
2. Enable automatic daily backups
3. Or manually export data via SQL:

```sql
COPY survey_responses TO '/path/to/backup.csv' CSV HEADER;
```

### Viewing Survey Data

#### Option 1: Supabase Dashboard
1. Go to **Table Editor**
2. Select `survey_responses`
3. View, filter, and export data

#### Option 2: SQL Queries

View all surveys:
```sql
SELECT * FROM survey_responses ORDER BY created_at DESC;
```

Statistics by operator:
```sql
SELECT 
    operator,
    COUNT(*) as total_surveys,
    AVG(impediment_contabil_score) as avg_impediment,
    AVG(justificare_obligativitate_score) as avg_justification,
    AVG(capabil_contabilitate_proprie_score) as avg_capability
FROM survey_responses 
GROUP BY operator;
```

Export to CSV:
```sql
COPY (
    SELECT * FROM survey_responses 
    ORDER BY created_at DESC
) TO STDOUT WITH CSV HEADER;
```

## Troubleshooting

### Problem: "Cannot connect to Supabase"
**Solution**: Check your `.env.local` file and ensure the URL and key are correct.

### Problem: "Company not found" when entering CUI
**Solution**: 
- Verify the CUI is correct
- Try without the "RO" prefix
- Check ANAF API status at https://webservicesp.anaf.ro

### Problem: "Error submitting survey"
**Solution**:
- Check if database table exists
- Verify Supabase connection
- Check browser console for detailed error

### Problem: Application won't start
**Solution**:
```bash
# Clear cache and reinstall
rm -rf node_modules .next
npm install
npm run dev
```

## Performance Optimization (Future)

For better performance with large datasets:

1. **Add pagination** to survey results
2. **Implement caching** for ANAF API responses
3. **Add indexes** to frequently queried columns
4. **Optimize images** and static assets
5. **Enable compression** on the server

## Support Contacts

For technical issues:
- Check console logs (F12 in browser)
- Review error messages
- Consult documentation files

## Changelog

### Version 1.0.0 (2026-02-08)
- Initial release
- Login system for Alexandra and Nectarie
- CUI lookup with ANAF integration
- 7-question survey form
- Supabase integration
- Success notifications
- Auto-reset for consecutive surveys
