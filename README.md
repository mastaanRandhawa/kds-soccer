# KDS Soccer Tournament Website

A full-stack soccer tournament website with live scores, tournament brackets, and admin panel.

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Framer Motion, React Query
- **Backend**: Node.js, Express, TypeScript, Prisma, PostgreSQL
- **API Documentation**: Swagger

## Project Structure

```
kds-soccer/
├── backend/           # Express API server
│   ├── prisma/        # Database schema and migrations
│   └── src/           # API source code
│       ├── routes/    # API routes
│       ├── middleware/# Auth middleware
│       └── lib/       # Utilities
│
├── frontend/          # React application
│   └── src/
│       ├── components/# UI components
│       ├── pages/     # Page components
│       ├── lib/       # API client & utilities
│       └── store/     # State management
│
└── requirements.md    # Project requirements
```

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- npm or yarn

### Backend Setup

1. Navigate to the backend folder:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file from example:
```bash
cp .env.example .env
```

4. Update the DATABASE_URL in `.env` with your PostgreSQL connection string:
```
DATABASE_URL="postgresql://postgres:password@localhost:5432/kds_soccer?schema=public"
JWT_SECRET="your-secret-key"
SESSION_SECRET="your-session-secret"
```

5. Generate Prisma client and run migrations:
```bash
npx prisma generate
npx prisma migrate dev --name init
```

6. Seed the database with sample data:
```bash
npm run seed
```

7. Start the development server:
```bash
npm run dev
```

The API will be running at `http://localhost:3001`
API Documentation available at `http://localhost:3001/api-docs`

### Frontend Setup

1. Navigate to the frontend folder:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will be running at `http://localhost:5173`

## Default Admin Credentials

After seeding the database:
- **Username**: admin
- **Password**: admin123

## Features

### Public Pages
- **Home**: Tournament overview with hero section, live matches, and image gallery
- **Live Scores**: Real-time match scores with auto-refresh (30s interval)
- **Bracket**: Visual tournament bracket showing match progression
- **UFSA Rules**: External link to official rules

### Admin Panel
- **Dashboard**: Overview of teams, matches, and media
- **Team Management**: Add, edit, delete teams
- **Match Management**: Create matches, update live scores
- **Media Management**: Manage homepage gallery images

## Styling

The website uses a modern, clean design based on the PulseFitHero component style:

- **Colors**: 
  - Primary: #1a1a1a (dark text)
  - Secondary: #4a5568 (muted text)
  - Accent: #10B981 (live status)
  - Background gradient: #E8F0FF → #F5F9FF → #FFFFFF

- **Typography**: Inter font family
- **Animations**: Framer Motion for smooth transitions

## License

MIT
