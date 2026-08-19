# Worikambo R/C JHS Full-Stack Website

## Stack
- Frontend: HTML/CSS/JavaScript
- Backend: Node.js + Express
- Database: SQLite
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
1. Install Node.js (LTS).
2. Open a terminal in this folder.
3. Run:
   `npm install`
4. Copy `.env.example` to `.env` and replace SESSION_SECRET with a strong random secret.
5. Run:
   `npm start`
6. Open:
   `http://localhost:3000`

## Demo accounts
Admin:
- Student ID: `ADMIN-001`
- Password: `Admin@123`

Student:
- Student ID: `WRJHS-2026-001`
- Password: `Student@123`

Change these credentials before any real deployment.

## What the backend now supports
- Student/old-student authentication
- Hashed passwords
- Persistent SQLite database
- Student results
- Resources
- Admin-created students
- Graduation transition from `active_student` to `old_student`
- Former headteacher/administrator records
- Hall of Fame records
- News records
- Admin dashboard

## Important production security
This is a functional starter backend, not a production-ready school information system. Before public deployment:
- change demo credentials and session secret
- use HTTPS and secure cookies
- validate and sanitize all input
- add CSRF protection
- add rate limiting
- implement password reset securely
- use proper role/permission policies
- protect student records and comply with applicable privacy/data-protection requirements
- back up the database
- use secure file storage for student resources
- do not store passwords or sensitive student records in localStorage

The browser localStorage layer only caches public/non-sensitive data. Authentication remains server-side.


## Visual theme
The entire interface has been redesigned using **blue and white only**, including navigation, buttons, cards, forms, backgrounds, footer, portal and admin dashboard.
