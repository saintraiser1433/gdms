# GDMS - GIT Database Management System

Community Engagement Services Reporting System

## Overview

GDMS is a comprehensive report management system for tracking community engagement projects across academic terms. The system supports two user roles (Admin/School Head and Program Heads) with a complete workflow from report creation through approval.

## Features

### Authentication & Authorization
- Role-based access control (Admin and Program Head)
- Secure authentication with NextAuth.js
- Protected routes based on user roles

### For Program Heads
- Create detailed reports with objectives, KPIs, and strategies
- Track progress across 4 time periods (T1-T4)
- Submit reports for admin review
- View report status (Draft, Submitted, Approved, Disapproved)
- Edit draft reports before submission
- Hierarchical report organization by Course and School Year

### For Admins (School Heads)
- Review all submitted reports
- Approve or disapprove reports
- View all reports across all programs
- Dashboard with submission statistics
- Filter reports by status

### Report Structure
- **Basic Information**: Program name, implementation period, responsible person, location, course, school year
- **Objectives**: Multiple objectives per report
- **KPIs**: Multiple KPIs per objective
- **Strategies**: Multiple strategies per KPI with targets
- **Timeline Data (T1-T4)**: For each strategy:
  - Activities
  - Status (Not Started, In Progress, Completed, Cancelled)
  - Budget Allocated
  - Budget Source (NEW)
  - Budget Spent
  - Variance (auto-calculated)

### Additional Features
- Dark/Light theme toggle
- Print-optimized report views
- Responsive design
- Toast notifications
- Modern UI with shadcn/ui components

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Authentication**: NextAuth.js v5
- **Database**: PostgreSQL with Prisma ORM
- **UI Components**: shadcn/ui (Radix UI + Tailwind CSS)
- **Styling**: Tailwind CSS v4
- **Icons**: Remix Icons, Tabler Icons
- **Theme**: next-themes

## Database Schema

- **users**: User accounts with roles
- **reports**: Main report entries
- **objectives**: Report objectives
- **kpis**: Key Performance Indicators
- **strategies**: Strategies for each KPI
- **time_entries**: T1-T4 timeline data for each strategy
- **comments**: Admin comments on reports (for future implementation)

## Getting Started

### Prerequisites

- Node.js 20+ installed
- PostgreSQL database running
- Database credentials: postgres/postgres (default)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up the database:
   ```bash
   npm run db:generate
   npm run db:push
   npm run db:seed
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000)

### Demo Accounts

**Admin Account:**
- Email: admin@gdms.edu
- Password: admin123

**Program Head Accounts:**
- Email: nursing@gdms.edu
- Password: program123

- Email: engineering@gdms.edu
- Password: program123

## Project Structure

```
app/
├── (auth)/
│   └── login/          # Login page
├── dashboard/          # Dashboard redirect
├── reports/            # Program head reports
│   ├── new/           # Create new report
│   ├── [id]/          # View report
│   └── page.tsx       # Reports list
├── admin/             # Admin dashboard
└── api/               # API routes
    ├── auth/          # NextAuth routes
    └── reports/       # Report CRUD operations
components/
├── ui/                # shadcn/ui components
├── app-sidebar.tsx    # Main sidebar
├── site-header.tsx    # Header with theme toggle
├── nav-user.tsx       # User menu
└── theme-toggle.tsx   # Theme switcher
lib/
├── auth.ts            # NextAuth configuration
├── db.ts              # Prisma client
└── utils.ts           # Utility functions
prisma/
├── schema.prisma      # Database schema
└── seed.ts            # Database seeding
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run db:seed` - Seed database with demo users

## Environment Variables

Create a `.env` file with:

```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/gdms"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
```

## Key Features Implementation

### Report Creation
- Single-page form with nested sections
- Dynamic add/remove for objectives, KPIs, and strategies
- Default T1-T4 time periods (configurable)
- Auto-calculation of variance (Budget Allocated - Budget Spent)
- Save as draft or submit directly

### Status Workflow
1. **Draft** - Editable by creator
2. **Submitted** - Read-only, awaiting admin review
3. **Approved** - Locked, no further changes
4. **Disapproved** - Locked, view only

### Role-Based Access
- Program Heads can only see and edit their own reports
- Admins can view all reports
- Middleware protects admin routes
- API endpoints enforce authorization

### Print Functionality
- Landscape orientation
- Hides UI elements (sidebar, header)
- Full-width table layout
- Print button on report view page

## Future Enhancements

The current implementation includes the core functionality. Planned enhancements:

1. **Multi-level commenting system**: Cell-level, KPI-level, and section-level comments
2. **Advanced analytics**: Charts and dashboards with report data
3. **Export functionality**: Export reports to PDF/Excel
4. **Email notifications**: Notify users of status changes
5. **Edit functionality for draft reports**: Reusable form component
6. **Advanced filtering**: Filter reports by multiple criteria
7. **Audit logs**: Track all changes to reports

## License

MIT

## Support

For issues or questions, please contact the development team.
