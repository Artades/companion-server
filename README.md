# Companion Server

Backend for a small social platform where people can find company for hikes,
walks, trips, and other outdoor activities.

The idea is simple: open the app, find an event nearby, see who is going, and
join people who are into the same kind of activity.

## What It Does

- Auth with email/password and Google OAuth
- User profiles with city, bio, avatar, social links, and interests
- Public and private events
- Event search and recommendations by city, interests, difficulty, date, and radius
- Event participants and invitations
- Friend requests
- Reviews for events
- Media upload for event photos and profile avatars
- Notifications powered by internal domain events

## Stack

- NestJS
- GraphQL
- Prisma
- PostgreSQL
- JWT auth
- Google OAuth



```env
DATABASE_URL="postgresql://postgres:root@localhost:5432/companion"
PORT=4000
FRONTEND_URL="http://localhost:3000"
COOKIE_DOMAIN="localhost"
JWT_SECRET="your-secret"
JWT_ACCESS_TOKEN_TTL="2h"
JWT_REFRESH_TOKEN_TTL="7d"
GOOGLE_OAUTH_CLIENT_ID="..."
GOOGLE_OAUTH_CLIENT_SECRET="..."
GOOGLE_OAUTH_CLIENT_CALLBACK_URL="http://localhost:4000/auth/google/callback"
```

Apply database migrations:

```bash
npx prisma migrate dev
```

Start the server:

```bash
npm run start:dev
```

GraphQL schema is generated at `src/schema.gql`.

