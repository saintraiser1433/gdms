# GDMS Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### Step 1: Setup Database (2 minutes)

```bash
# Generate Prisma client
npm run db:generate

# Create database tables
npm run db:push

# Add demo users
npm run db:seed
```

**What this does:**
- Creates all database tables (users, reports, objectives, kpis, etc.)
- Adds 3 demo users:
  - Admin: admin@gdms.edu / admin123
  - Program Head: nursing@gdms.edu / program123
  - Program Head: engineering@gdms.edu / program123

### Step 2: Start Development Server (30 seconds)

```bash
npm run dev
```

Open http://localhost:3000

### Step 3: Test the System (2 minutes)

#### As Program Head:
1. Login with `nursing@gdms.edu` / `program123`
2. Click "New Report"
3. Fill in basic information
4. Add at least 1 objective, 1 KPI, and 1 strategy
5. Fill timeline data for T1
6. Click "Submit Report"

#### As Admin:
1. Logout
2. Login with `admin@gdms.edu` / `admin123`
3. See the submitted report in "Pending Review"
4. Click "Approve" button
5. View approved report

### Step 4: Explore Features

- **Theme Toggle**: Click sun/moon icon in header
- **Print**: View a report and click "Print Report"
- **Create Multiple Reports**: Try different courses and school years
- **Draft Management**: Save reports as drafts before submitting

## 📝 Quick Commands

```bash
# Full database reset (drops and recreates everything)
npm run db:reset

# Just add demo users again
npm run db:seed

# Build for production
npm run build

# Start production server
npm start
```

## 🎯 Quick Test Data

Copy-paste this into a new report:

**Basic Info:**
- Program Name: Community Health Outreach Program
- Implementation Period: 2025
- Responsible Person: John Doe / Program Coordinator
- Location: Glan, Sarangani Province
- Course: Bachelor of Science in Nursing
- School Year: 2025-2026

**Objective 1:**
- Title: Improve community health awareness

**KPI 1:**
- Description: Number of participants reached

**Strategy 1:**
- Description: Conduct health education sessions
- Target: 100 participants

**Timeline T1:**
- Activities: Conducted 5 health education sessions
- Status: Completed
- Budget Allocated: 10000
- Budget Source: University Grant
- Budget Spent: 9500

## ✅ Verification Checklist

After setup, verify:
- [ ] Can login as admin
- [ ] Can login as program head  
- [ ] Can create new report
- [ ] Can submit report
- [ ] Admin can see submitted report
- [ ] Admin can approve report
- [ ] Can print report
- [ ] Theme toggle works

## 🆘 Troubleshooting

**Database connection failed?**
- Ensure PostgreSQL is running
- Check username/password in `.env` (default: postgres/postgres)
- Verify database name is `gdms`

**Login not working?**
- Clear browser cache
- Check if `npm run db:seed` completed successfully
- Verify .env has NEXTAUTH_SECRET set

**Reports not showing?**
- Check browser console for errors
- Verify you're logged in with correct role
- Program heads only see their own reports

**Can't create report?**
- Must be logged in as Program Head
- All required fields must be filled
- Check browser console for validation errors

## 📱 Access URLs

- Login: http://localhost:3000/login
- Dashboard: http://localhost:3000/dashboard (auto-redirects)
- Reports List: http://localhost:3000/reports
- Create Report: http://localhost:3000/reports/new
- Admin Dashboard: http://localhost:3000/admin

## 💡 Tips

1. **Test with Multiple Users**: Try both program head accounts to see reports separated by user
2. **Use Different Courses**: Create reports for different courses to test grouping
3. **Try All Statuses**: Create draft, submit, approve, and disapprove to see all workflows
4. **Print Testing**: Use browser's print preview (Ctrl+P) to see print layout
5. **Dark Mode**: Toggle theme to ensure readability in both modes

## 🎉 You're Ready!

The system is now fully set up and ready to use. Refer to:
- `README.md` for full documentation
- `DEPLOYMENT.md` for production deployment
- `IMPLEMENTATION_SUMMARY.md` for technical details

Happy reporting! 🚀
