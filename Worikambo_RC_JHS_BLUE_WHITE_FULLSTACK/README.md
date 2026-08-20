# Worikambo R/C JHS Full-Stack Website

## Stack
- Frontend: HTML/CSS/JavaScript
- Backend: Node.js + Express
- Database: SQLite for local development
- Authentication: Express sessions + bcrypt password hashing
- Local storage: browser localStorage for non-sensitive public-data caching

## Pages
- index.html
- about.html
- portal.html
- alumni.html
- hall-of-fame.html
- leadership.html
- news.html
- admin.html

## Run locally
1. Install Node.js 20+ LTS.
2. Open a terminal in this folder.
3. Run `npm install`.
4. Copy `.env.example` to `.env` and set a strong `SESSION_SECRET`.
5. Run `npm start`.
6. Open `http://localhost:3000`.

## Demo accounts
Admin:
- Student ID: `ADMIN-001`
- Password: `Admin@123`

Student:
- Student ID: `WRJHS-2026-001`
- Password: `Student@123`

Change these credentials before real deployment.

## Vercel deployment
The project now contains `api/index.js` and `vercel.json` for Vercel routing.

In Vercel, import the GitHub repository and set **Root Directory** to:
`Worikambo_RC_JHS_BLUE_WHITE_FULLSTACK`

Then add this environment variable:
`SESSION_SECRET` = a long random secret.

No Build Command is required. Vercel should detect the Node.js API entrypoint.

### Important database note
The current SQLite implementation is suitable for local development and testing. Vercel's serverless filesystem is not a durable database, so SQLite data must **not** be treated as permanent production storage on Vercel.

For the real school deployment, move the database to a hosted PostgreSQL service (for example Supabase/Neon) and move sessions to a durable external session store. The application should then use environment variables for the database connection.

## Backend features
- Student/old-student authentication
- Hashed passwords
- Student results
- Resources
- Admin-created students
- Graduation transition from `active_student` to `old_student`
- Former headteacher/administrator records
- Hall of Fame records
- News records
- Admin dashboard
- Health endpoint at `/api/health`

## Security before production
- Change demo credentials and session secret.
- Use HTTPS and secure cookies.
- Validate and sanitize all input.
- Add CSRF protection and rate limiting.
- Implement secure password reset.
- Enforce role/permission policies.
- Protect student records and follow applicable privacy/data-protection requirements.
- Never store passwords or sensitive student records in localStorage.
- Use durable hosted database storage for production.

## Visual theme
The entire interface uses **blue and white only**, including navigation, buttons, cards, forms, backgrounds, footer, portal and admin dashboard.
