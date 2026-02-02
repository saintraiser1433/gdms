# GDMS Deployment Checklist

## Pre-Deployment

- [x] PostgreSQL database provisioned and accessible
- [x] Environment variables configured in `.env`
- [x] Database schema pushed (`npm run db:push`)
- [x] Database seeded with initial users (`npm run db:seed`)
- [x] NEXTAUTH_SECRET generated and set
- [x] All dependencies installed
- [ ] Run production build test (`npm run build`)
- [ ] Test all user flows manually

## User Flow Testing

### Authentication
- [ ] Login as admin (admin@gdms.edu / admin123)
- [ ] Login as program head (nursing@gdms.edu / program123)
- [ ] Verify logout functionality
- [ ] Verify role-based redirects (admin -> /admin, program head -> /reports)

### Program Head Workflow
- [ ] Create new report with complete data
- [ ] Save as draft
- [ ] Edit draft report
- [ ] Submit report
- [ ] Verify submitted report is read-only
- [ ] View report details
- [ ] Print report
- [ ] Toggle dark/light theme

### Admin Workflow
- [ ] View admin dashboard
- [ ] See pending reports count
- [ ] Review submitted report
- [ ] Approve report
- [ ] Disapprove report
- [ ] View all reports tabs (Submitted, Approved, Disapproved, All)
- [ ] Navigate to report details

### Database Verification
- [ ] Connect to PostgreSQL database
- [ ] Verify tables exist (users, reports, objectives, kpis, strategies, time_entries, comments)
- [ ] Check seeded users are present
- [ ] Verify foreign key relationships

## Deployment Steps

### Local Testing
1. Stop the dev server if running
2. Build the application:
   ```bash
   npm run build
   ```
3. Start the production server:
   ```bash
   npm start
   ```
4. Test all workflows at http://localhost:3000

### Production Deployment (Example: Vercel/Railway/DigitalOcean)

1. **Database Setup**
   - Create production PostgreSQL database
   - Note connection string

2. **Environment Variables**
   ```
   DATABASE_URL=your-production-database-url
   NEXTAUTH_URL=https://your-domain.com
   NEXTAUTH_SECRET=generate-new-secret-for-production
   ```

3. **Deploy Application**
   - Connect repository to hosting platform
   - Set environment variables
   - Deploy

4. **Post-Deployment**
   - Run database migrations/push
   - Seed initial admin user
   - Test login and basic functionality

## Security Checklist

- [ ] NEXTAUTH_SECRET is strong and unique
- [ ] Database password is strong
- [ ] `.env` file is in `.gitignore`
- [ ] Production database is not publicly accessible
- [ ] HTTPS is enabled for production
- [ ] CORS is properly configured

## Known Limitations

1. **Edit Functionality**: Draft reports can be edited through the API, but a dedicated edit page is not yet implemented. Program heads need to delete and recreate if they want to modify a draft.

2. **Comments System**: The database schema and API routes for comments are ready, but the UI for adding/viewing comments is not yet implemented.

3. **Email Notifications**: No email system is integrated. Status changes are only visible when users log in.

4. **File Uploads**: No support for attaching documents or images to reports.

5. **Advanced Search**: Basic filtering by course/school year is available, but advanced search is not implemented.

6. **Audit Trail**: While the database tracks created/submitted/reviewed dates, there's no comprehensive audit log UI.

## Performance Notes

- Database queries are optimized with Prisma includes
- Indexes are set on frequently queried fields (status, course, schoolYear, createdById)
- No pagination implemented yet - recommended if reports exceed 100 per user

## Maintenance

### Adding New Users
Run a script similar to `prisma/seed.ts` or use a database GUI to insert users with hashed passwords (bcrypt).

### Backup Strategy
- Regular PostgreSQL backups recommended
- Export important reports to PDF before major system changes

### Monitoring
- Monitor database connection pool
- Track API response times
- Monitor authentication failures

## Support

For issues during deployment, check:
1. Database connection string format
2. Environment variables are properly set
3. Node.js version compatibility (v20+)
4. PostgreSQL version (v13+)

## Success Criteria

Deployment is successful when:
- [ ] Admin can log in and see dashboard
- [ ] Program head can log in and see reports
- [ ] New report can be created and submitted
- [ ] Admin can approve/disapprove reports
- [ ] Print functionality works
- [ ] Theme toggle works
- [ ] No console errors in browser
- [ ] No server errors in logs
