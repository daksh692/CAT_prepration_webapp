# CAT Prep Tracker API - Setup Guide

## Prerequisites

1. **XAMPP** running with MariaDB
2. **Node.js** installed (v16 or higher)
3. Database **catprep_tracker** already created in phpMyAdmin

## Setup Steps

### 1. Import Database Schema
1. Open phpMyAdmin: http://localhost/phpmyadmin
2. Select database `catprep_tracker`
3. Click "Import" tab
4. Choose file: `e:\Akshat\catprep_database_schema.sql`
5. Click "Go"

### 2. Install Backend Dependencies
```bash
cd e:\Akshat\CATPrep-Web\server
npm install
```

### 3. Seed the Database
```bash
npm run seed
```

### 4. Start the Backend Server
```bash
npm start
```
or for development with auto-restart:
```bash
npm run dev
```

Server will run on: **http://localhost:5000**

### 5. Test the API

Open browser and test:
- http://localhost:5000/api/health
- http://localhost:5000/api/modules
- http://localhost:5000/api/chapters

## API Endpoints

### Modules
- `GET /api/modules` - Get all modules
- `GET /api/modules/:id` - Get single module
- `GET /api/modules/section/:section` - Get modules by section (VARC/DILR/QA)

### Chapters
- `GET /api/chapters` - Get all chapters
- `GET /api/chapters/:id` - Get single chapter
- `GET /api/chapters/module/:moduleId` - Get chapters by module
- `GET /api/chapters/name/:name` - Get chapter by name

### Study Materials
- `GET /api/study/chapter/:chapterId` - Get all study materials for a chapter
- `GET /api/study/skip-test/:chapterId` - Get skip test questions
- `GET /api/study/chapters-with-materials` - Get chapters that have study materials

## Troubleshooting

**Error: Cannot connect to database**
- Make sure XAMPP MySQL is running
- Check database name is `catprep_tracker`
- Verify `.env` file has correct credentials

**Error: EADDRINUSE**
- Port 5000 is already in use
- Change PORT in `.env` to 5001 or another port

**Error: Module not found**
- Run `npm install` in the server directory
