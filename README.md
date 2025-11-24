# CarbonTrack

A full-stack web application for tracking household energy consumption and carbon footprint.

## 🌐 Live Demo

- **Frontend**: [https://carbontrack-jnu6.onrender.com/](https://carbontrack-jnu6.onrender.com/)
- **Backend API**: [http://carbontrack-backend-d40t.onrender.com/](http://carbontrack-backend-d40t.onrender.com/)

> **Note**: The apps are hosted on Render's free tier. Initial load may take 30-60 seconds as the services spin up from sleep mode.

## 🌟 Features

### Core Features

- **Google OAuth Authentication** - Secure login with Google accounts
- **Household Management** - Create or join existing households with unique home codes
- **Multi-step Onboarding** - Intuitive onboarding flow to set up your home
- **Country-based Emission Factors** - Automatic fetching of emission data from Climatiq API
- **Appliance Tracking** - Track 10+ household appliances and their quantities
- **Real-time Data** - Live updates of household information

### Dashboard & Analytics

- **Real-time Dashboard** - View current day hourly emissions with interactive charts
- **Weekly & Monthly Analytics** - Visualize consumption trends over time
- **Appliance Breakdown** - Pie charts showing emission contribution by appliance
- **Peak Hour Analysis** - Identify high-consumption periods
- **Weekday vs Weekend Comparison** - Compare usage patterns
- **Global Comparison** - Compare your home's average emissions against all homes

### AI-Powered Insights

- **Gemini AI Integration** - Generate personalized energy-saving recommendations
- **Smart Suggestions** - Up to 10 actionable insights per day based on your usage patterns
- **Impact Levels** - Insights categorized by high, medium, and low impact
- **Tag-based Filtering** - Filter insights by category (appliance, timing, sustainability, etc.)
- **Automated Generation** - Daily insights generated automatically by scheduler

### Emission Simulation

- **Hourly Emission Simulation** - Realistic 24-hour emission profiles for each appliance
- **Seasonal Adjustments** - Emission patterns vary by season and hemisphere
- **Weekend Multipliers** - Different usage patterns for weekdays vs weekends
- **Usage Windows** - Appliance-specific peak usage times (morning, evening, all-day)
- **Daily Scheduling** - Automatic simulation runs at midnight IST for all homes

## 🛠️ Tech Stack

### Backend

- **Node.js** (v16+) with Express.js
- **MongoDB** with Mongoose ODM
- **Passport.js** for Google OAuth 2.0 authentication
- **JWT** for session management and token-based auth
- **node-cron** for scheduled tasks (daily simulations, insights)
- **@google/generative-ai** for Gemini AI integration
- **Climatiq API** integration for emission factors
- **nanoid** for unique home code generation
- **dotenv** for environment variable management

### Frontend

- **React 19** with Vite (fast HMR and builds)
- **React Router v6** for client-side routing
- **Zustand** for state management with persist middleware
- **shadcn/ui** components with Radix UI primitives
- **Tailwind CSS** for utility-first styling
- **Recharts** for interactive data visualizations
- **Axios** for API requests with interceptors
- **Sonner** for toast notifications
- **Framer Motion** for animations and transitions
- **Lucide React** for icon library

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB Atlas account or local MongoDB instance
- Google OAuth credentials (Client ID & Secret)
- Climatiq API key

## 🚀 Installation

### 1. Clone the repository

```bash
git clone https://github.com/vedrathavi/CarbonTrack.git
cd "SDL Project"
```

### 2. Backend Setup

```bash
cd Backend
npm install
```

Create a `.env` file in the Backend directory:

```env
# Database
MONGO_URI=your_mongodb_connection_string

# Authentication
JWT_SECRET=your_jwt_secret_key_min_32_characters
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Frontend URL (for CORS and cookies)
CLIENT_URL=http://localhost:5173

# Climatiq API (emission factors)
CLIMATIQ_API_KEY=your_climatiq_api_key
CLIMATIQ_API_URL=https://api.climatiq.io/data/v1/estimate

# Google Gemini API (AI insights) - Optional
GEMINI_API_KEY=your_gemini_api_key

# Server
PORT=5000
```

**Note:** The app works without `GEMINI_API_KEY`, but insights won't be generated. Get a free API key at [Google AI Studio](https://aistudio.google.com/app/apikey).

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

Create a `.env` file in the frontend directory:

```env
VITE_SERVER_URL=http://localhost:5000
```

## 🏃 Running the Application

### Development Mode

#### Option 1: Start Backend and Frontend Separately

**Backend:**

```bash
cd Backend
node server.js
```

Backend will run on `http://localhost:5000`

**Frontend:**

```bash
cd frontend
npm run dev
```

Frontend will run on `http://localhost:5173`

This script starts both backend and frontend in parallel.

### Initial Setup & Data Generation

After starting the server for the first time:

1. **Create your first home** through the UI onboarding flow
2. **Backfill emission data** for the last 30 days:
   ```bash
   cd Backend
   node scripts/backfill_emissions.js
   ```
3. **Generate initial insights** (if `GEMINI_API_KEY` is set):
   ```bash
   cd Backend
   node scripts/run_insight_for_home.js
   ```

The scheduler will automatically generate data for future days at midnight IST.

## 📁 Project Structure

```
SDL Project/
├── Backend/
│   ├── scripts/
│   │   ├── backfill_emissions.js     # Backfill missing daily emission docs
│   │   ├── run_insight_for_home.js   # Generate insights for a specific home
│   │   └── testSim.js                # Test simulation service
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── authController.js         # Authentication & user endpoints
│   │   │   ├── dashboardController.js    # Dashboard analytics endpoints
│   │   │   ├── emissionController.js     # Emission factor endpoints
│   │   │   ├── homeController.js         # Home CRUD operations
│   │   │   ├── insightController.js      # AI insights endpoints
│   │   │   └── simulationController.js   # Simulation trigger endpoints
│   │   ├── middleware/
│   │   │   └── verifyToken.js            # JWT authentication middleware
│   │   ├── models/
│   │   │   ├── EmissionFactor.js         # Emission factor cache
│   │   │   ├── Home.js                   # Home schema
│   │   │   ├── HourlyEmission.js         # Daily emission data (24h arrays)
│   │   │   ├── Insight.js                # AI-generated insights
│   │   │   └── User.js                   # User profile & OAuth
│   │   ├── routes/
│   │   │   ├── authRoutes.js             # /api/auth routes
│   │   │   ├── dashboardRoutes.js        # /api/dashboard routes
│   │   │   ├── emissionRoutes.js         # /api/emission-factor routes
│   │   │   ├── homeRoutes.js             # /api/home routes
│   │   │   ├── insightRoutes.js          # /api/insights routes
│   │   │   └── simulationRoutes.js       # /api/simulation routes
│   │   ├── services/
│   │   │   ├── dashboardService.js       # Dashboard data aggregation
│   │   │   ├── emissionFactorService.js  # Climatiq API integration
│   │   │   ├── insightService.js         # Gemini AI insight generation
│   │   │   ├── passport.js               # Passport Google OAuth config
│   │   │   ├── scheduler.js              # Cron jobs (daily simulation, insights)
│   │   │   └── simulationService.js      # Hourly emission simulation logic
│   │   └── utils/
│   │       ├── emissionProfile.js        # Appliance energy ratings & usage patterns
│   │       ├── errors.js                 # Custom error classes
│   │       ├── geminiClient.js           # Google Gemini API wrapper
│   │       └── hemishereMap.js           # Hemisphere detection for seasonal adjustments
│   ├── .env                  # Environment variables
│   ├── server.js             # Express app entry point
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Dashboard/
    │   │   │   ├── AppliancePieChart.jsx     # Pie chart for appliance breakdown
    │   │   │   ├── ComparisonStat.jsx        # Global comparison widget
    │   │   │   ├── HomeMembers.jsx           # Member list display
    │   │   │   ├── HourlyLineChart.jsx       # 24-hour line chart
    │   │   │   ├── Layout.jsx                # Dashboard layout wrapper
    │   │   │   ├── MonthlyBarChart.jsx       # Monthly bar chart
    │   │   │   ├── Sidebar.jsx               # Navigation sidebar
    │   │   │   ├── TopContributor.jsx        # Top appliance widget
    │   │   │   ├── TotalCard.jsx             # Total emission card
    │   │   │   ├── WeekdayWeekendChart.jsx   # Weekday vs weekend chart
    │   │   │   ├── WeeklyBarChart.jsx        # Weekly bar chart
    │   │   │   └── WeeksBarChart.jsx         # Multi-week trend chart
    │   │   └── ui/                           # shadcn/ui components
    │   │       ├── button.jsx, checkbox.jsx, dialog.jsx
    │   │       ├── input.jsx, label.jsx, select.jsx, sonner.jsx
    │   ├── hooks/
    │   │   ├── useAuthHook.js            # Authentication state hook
    │   │   ├── useDashboardData.js       # Dashboard data fetching hook
    │   │   ├── useHomeHook.js            # Home management hook
    │   │   └── useInsights.js            # Insights data fetching hook
    │   ├── lib/
    │   │   ├── apiClient.js              # Axios instance with interceptors
    │   │   └── utils.js                  # Utility functions (cn, etc.)
    │   ├── pages/
    │   │   ├── dashboard/
    │   │   │   ├── Dashboard.jsx         # Main dashboard page
    │   │   │   ├── Profile.jsx           # User profile page
    │   │   │   └── sections/
    │   │   │       ├── DashboardSection.jsx  # Dashboard home section
    │   │   │       ├── EducationSection.jsx  # Education content
    │   │   │       └── Option3Section.jsx    # Insights section (AI recommendations)
    │   │   ├── onboarding/
    │   │   │   ├── CreateHomeDetails.jsx    # Step 2: Home details form
    │   │   │   ├── CreateHomeLocation.jsx   # Step 1: Location selection
    │   │   │   ├── HomeSelection.jsx        # Choose create/join
    │   │   │   ├── JoinHome.jsx             # Join home by code
    │   │   │   └── Landing.jsx              # Landing page
    │   │   └── Loading.jsx               # Loading state component
    │   ├── stores/
    │   │   ├── useAppStore.js            # Main Zustand store (persisted)
    │   │   └── slice/
    │   │       ├── authSlice.js          # Auth state & actions
    │   │       ├── homeSlice.js          # Home state & actions
    │   │       └── insightSlice.js       # Insights state & actions
    │   ├── utils/
    │   │   └── constants.js              # API route constants
    │   ├── App.css
    │   ├── App.jsx                       # Router & route definitions
    │   ├── index.css                     # Global styles (Tailwind)
    │   └── main.jsx                      # React entry point
    ├── .env                              # Frontend env (VITE_SERVER_URL)
    ├── index.html
    ├── vite.config.js
    └── package.json
```

## 🔐 Authentication Flow

### Google OAuth 2.0 Flow

1. User clicks "Login with Google" on landing page
2. Frontend redirects to `GET /api/auth/google`
3. Backend redirects to Google OAuth consent screen
4. User authorizes the app
5. Google redirects to `GET /api/auth/google/callback`
6. Backend:
   - Extracts user profile from Google
   - Creates or updates User document in MongoDB
   - Generates JWT token
   - Sets HTTP-only cookie with JWT
   - Redirects to frontend (`CLIENT_URL`)
7. Frontend:
   - Calls `GET /api/auth/me` (JWT sent via cookie)
   - Receives user info and stores in Zustand
   - Redirects to dashboard or onboarding

### JWT Cookie Configuration

**Development:**

```javascript
{
  httpOnly: true,      // Not accessible via JavaScript
  sameSite: 'lax',     // CSRF protection for same-site requests
  secure: false,       // Allow HTTP in development
  maxAge: 7 days
}
```

**Production:**

```javascript
{
  httpOnly: true,
  sameSite: 'none',    // Allow cross-origin (frontend ≠ backend domain)
  secure: true,        // Require HTTPS
  maxAge: 7 days
}
```

### Protected Routes

Backend routes use `verifyToken` middleware:

```javascript
router.get("/protected", verifyToken, handler);
```

Frontend routes use `PrivateRoute` component:

```javascript
<Route
  path="/dashboard"
  element={
    <PrivateRoute>
      <Dashboard />
    </PrivateRoute>
  }
/>
```

## 🔐 Environment Variables

### Backend (.env)

| Variable               | Description                                      |
| ---------------------- | ------------------------------------------------ |
| `MONGO_URI`            | MongoDB connection string                        |
| `JWT_SECRET`           | Secret key for JWT tokens                        |
| `CLIENT_URL`           | Frontend URL for CORS                            |
| `GOOGLE_CLIENT_ID`     | Google OAuth Client ID                           |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret                       |
| `CLIMATIQ_API_KEY`     | Climatiq API key for emission data               |
| `CLIMATIQ_API_URL`     | Climatiq API endpoint                            |
| `GEMINI_API_KEY`       | Google Gemini API key for AI insights (optional) |
| `PORT`                 | Server port (default: 5000)                      |

### Frontend (.env)

| Variable          | Description     |
| ----------------- | --------------- |
| `VITE_SERVER_URL` | Backend API URL |

## 🌍 API Endpoints

### Authentication

- `GET /api/auth/google` - Initiate Google OAuth
- `GET /api/auth/google/callback` - OAuth callback
- `GET /api/auth/me` - Get current authenticated user info
- `GET /api/auth/logout` - Logout user

### Home Management

- `POST /api/home` - Create a new home
- `POST /api/home/join` - Join existing home by code
- `GET /api/home/me` - Get user's home details
- `PATCH /api/home` - Update home details (admin only)
- `GET /api/home/stats` - Get home statistics

### Dashboard Analytics

- `GET /api/dashboard/:homeId/today` - Get today's hourly emissions
- `GET /api/dashboard/:homeId/week?days=7` - Get weekly emissions summary
- `GET /api/dashboard/:homeId/month?days=30` - Get monthly emissions summary
- `GET /api/dashboard/:homeId/comparison?days=7` - Compare home average vs global average

### Emission Simulation

- `POST /api/simulation/run` - Manually run simulation for a home/date
  - Body: `{ homeId: string, date?: string (YYYY-MM-DD) }`
- `POST /api/simulation/run-all` - Run simulation for all homes
  - Body: `{ date?: string (YYYY-MM-DD) }`
- `GET /api/simulation/latest/:homeId` - Get latest emission document for home
- `GET /api/simulation/hourly/:homeId?hour=15&date=YYYY-MM-DD&simulate=true` - Get hourly emission at specific hour

### AI Insights

- `GET /api/insights/:homeId/latest?limit=10` - Get latest insights for home
- `POST /api/insights/generate/:homeId` - Manually generate insights for home
  - Body: `{ dashboardPayload?: object }` (optional dashboard data)

### Emission Factors

- `GET /api/emission-factor?country=XX` - Get emission factor for country

## 📊 Data Models

### User

- Email, name, profile picture
- Household ID reference
- Google OAuth profile (ID, access token)
- Role within household (admin/member)

### Home

- Unique home code (8 characters, auto-generated)
- Address (country, state, city)
- Total rooms
- Appliances with quantities (10 types):
  - Air Conditioner, Refrigerator, Washing Machine, TV, Computer
  - Fan, Lights, Vacuum Cleaner, Electric Stove, Microwave
- Emission factor (gCO2/kWh as float)
- Members array with user IDs and roles (admin/member)
- Created by user reference

### HourlyEmission

- Home ID reference
- Date (normalized to UTC midnight)
- Emissions map: appliance -> array of 24 hourly values (grams CO2)
- Total hourly array: sum across all appliances for each hour
- Summary:
  - Total emissions (grams per day)
  - Top appliance (highest contributor)
- Unique index on `{ homeId, date }`
- Auto-computed via pre-save hook

### Insight

- Home ID reference
- Type (e.g., "suggestion", "tip", "alert")
- Title and description (AI-generated)
- Icon name (for UI rendering)
- Impact level: "high", "medium", "low"
- Tags array (e.g., "appliance", "timing", "cooling", "heating")
- Generated at timestamp (normalized to UTC day)
- Source ID (deterministic hash for deduplication)
- Unique index on `{ homeId, sourceId, generatedAt }`

### EmissionFactor

- Country code (ISO 3166-1 alpha-2)
- Emission factor value (gCO2/kWh as float)
- Auto-cached from Climatiq API
- TTL for cache invalidation

## 🏗️ Backend Details

This project backend is structured to separate transport (routes), request handling (controllers), business logic (services), and persistence (models). Below is a short reference to help contributors navigate the `Backend/src` code.

- **Entry point**: `Backend/server.js` — starts the Express app, registers middleware and routes, and reads environment variables.

- **Routes** (in `Backend/src/routes`):

  - `authRoutes.js` — authentication and user endpoints (Google OAuth, logout, current user).
  - `homeRoutes.js` — home-related endpoints (create/join/update home, get home stats).
  - `dashboardRoutes.js` — dashboard analytics endpoints (today, week, month, comparison).
  - `simulationRoutes.js` — simulation trigger endpoints (run for one/all homes, fetch latest).
  - `insightRoutes.js` — AI insights endpoints (fetch latest, generate on-demand).
  - `emissionRoutes.js` — emission-factor lookup endpoints.

- **Controllers** (in `Backend/src/controllers`): Controllers accept validated HTTP requests from routes and call services or models to perform actions. Key controllers:

  - `authController.js` — handles login/callback, user creation and session endpoints.
  - `homeController.js` — create/join home flows, returning home details and admin operations.
  - `dashboardController.js` — fetches and formats dashboard analytics (today, week, month, comparison).
  - `simulationController.js` — triggers emission simulations, stores results in `HourlyEmission` collection.
  - `insightController.js` — fetches AI-generated insights, triggers on-demand generation.
  - `emissionController.js` — returns emission-factor data from cache or Climatiq API.

- **Services** (in `Backend/src/services`): Business logic and external API integrations live here.

  - `dashboardService.js` — aggregates emission data across date ranges, computes averages and comparisons.
  - `simulationService.js` — generates realistic 24-hour emission profiles using appliance energy ratings, usage windows, seasonal/weekend multipliers, and noise.
  - `insightService.js` — builds prompts from dashboard data, calls Gemini API, parses JSON responses, and stores insights with deduplication (sourceId).
  - `scheduler.js` — cron jobs that run daily at midnight IST to simulate emissions and generate insights for all homes.
  - `emissionFactorService.js` — integrates with the Climatiq API, caches results in MongoDB (`EmissionFactor` model), and normalizes values (gCO2/kWh).
  - `passport.js` — Passport/Google OAuth configuration used by `authRoutes`/`authController`.

- **Models** (in `Backend/src/models`): Mongoose models representing domain entities.

  - `User.js` — user profile, Google OAuth identifiers, and references to homes.
  - `Home.js` — home metadata (location, rooms, appliances, members, emission factor reference). Pre-save hook generates unique 8-character home codes.
  - `HourlyEmission.js` — stores daily emission data (24-hour arrays per appliance). Unique index on `{ homeId, date }`. Pre-save hook computes summary stats (total, top appliance).
  - `Insight.js` — AI-generated insights with title, description, tags, impact level. Unique index on `{ homeId, sourceId, generatedAt }` for deduplication. Pre-save hook normalizes `generatedAt` to UTC day.
  - `EmissionFactor.js` — cached emission factor per country (ISO code + value in gCO2/kWh).

- **Middleware** (in `Backend/src/middleware`):

  - `verifyToken.js` — JWT verification middleware applied to protected routes. Validates JWT from cookies and attaches user to `req.user`.

- **Utilities** (in `Backend/src/utils`):
  - `errors.js` — custom error types and helpers used by controllers and services.
  - `emissionProfile.js` — appliance energy ratings (kWh), default usage hours per day, usage windows (peak times), seasonal/weekend multipliers, usage distribution functions, and noise generators for realistic simulation.
  - `geminiClient.js` — lazy-initialized Google Gemini API client wrapper. Reads API key at call-time to avoid import-time env issues. Exports `generateTextWithSDK(model, prompt)`.
  - `hemishereMap.js` — hemisphere detection by country code (for seasonal adjustments).

Notes & conventions:

- Controllers are thin: they parse request input, call services, and return HTTP responses (status + body). Business rules, caching, and third-party API calls belong in services.
- Routes register Express handlers and mount middleware (e.g., `verifyToken`) to protect endpoints.
- Emission factors are stored as grams CO₂ per kWh (gCO2/kWh) and the frontend converts or formats units as needed.

If you want to extend the backend, look for the corresponding controller in `Backend/src/controllers` and follow the existing pattern: add a service function in `Backend/src/services`, test it in the controller, and then expose it via a new route under `Backend/src/routes`.

## 📅 Scheduler & Automation

The backend includes a scheduler (`Backend/src/services/scheduler.js`) that runs automated tasks using `node-cron`:

### Daily Job (00:00 IST / 18:30 UTC)

- **Simulates emissions** for all homes for the current day
- **Generates AI insights** for all homes based on recent emission data
- Runs automatically when the server starts
- Errors are logged but don't stop the scheduler

### Hourly Job

- Reserved for future real-time features (currently no-op)
- Runs at minute 0 of every hour

### Manual Triggers

You can manually trigger simulations and insights via API:

```bash
# Simulate for a specific home
curl -X POST http://localhost:5000/api/simulation/run \
  -H "Content-Type: application/json" \
  -d '{"homeId":"<HOME_ID>","date":"2025-11-24"}'

# Simulate for all homes
curl -X POST http://localhost:5000/api/simulation/run-all \
  -H "Content-Type: application/json" \
  -d '{"date":"2025-11-24"}'

# Generate insights for a home
curl -X POST http://localhost:5000/api/insights/generate/<HOME_ID>
```

## 🔧 Utility Scripts

Backend includes utility scripts in `Backend/scripts/`:

### backfill_emissions.js

Backfills missing `HourlyEmission` documents for a date range. Useful after adding new homes or when scheduler missed days.

```bash
cd Backend
# Backfill last 30 days (default)
node scripts/backfill_emissions.js

# Backfill custom range
node scripts/backfill_emissions.js 2025-10-01 2025-11-23
```

The script:

- Finds all homes in the database
- For each date in range, checks if emission doc exists
- If missing, runs `simulateAndSave` to generate it
- Skips existing docs to avoid duplicates
- Logs created/skipped/failed counts

### run_insight_for_home.js

Generates insights for a specific home (useful for testing).

```bash
cd Backend
# Generate for specific home
node scripts/run_insight_for_home.js <HOME_ID>

# Generate for first home in DB
node scripts/run_insight_for_home.js
```

### testSim.js

Tests the simulation service for a home (debugging tool).

```bash
cd Backend
node scripts/testSim.js
```

## 🎨 Frontend Architecture

### State Management (Zustand)

The app uses Zustand with persist middleware for state management:

- **authSlice** — user info, login/logout actions, JWT token handling
- **homeSlice** — home data, create/join/fetch actions
- **insightSlice** — insights data, fetch/generate actions with loading states

Store is persisted to localStorage (only `userInfo` and `home` slices).

### Custom Hooks

- **useAuthHook** — wraps auth slice, auto-fetches user on mount, handles logout
- **useHomeHook** — wraps home slice, provides create/join/fetch home functions
- **useDashboardData** — fetches today/week/month/comparison data, returns loading states
- **useInsights** — fetches insights for current home, auto-refreshes when home changes, provides manual refresh function

### Dashboard Components

Modular chart components built with Recharts:

- `HourlyLineChart` — 24-hour line chart with area fill
- `WeeklyBarChart` / `MonthlyBarChart` — bar charts for time-series data
- `AppliancePieChart` — pie chart showing appliance breakdown
- `ComparisonStat` — horizontal bar comparison (home vs global average)
- `WeekdayWeekendChart` — grouped bar chart comparing weekday/weekend patterns

### Routing

- **Public routes**: `/` (landing page with Google OAuth)
- **Onboarding routes**: `/onboarding/*` (home selection, create, join flows)
- **Protected routes** (require auth):
  - `/dashboard` — main dashboard with analytics
  - `/insights` — AI-generated recommendations (formerly `/option3`)
  - `/education` — educational content about carbon footprint
  - `/profile` — user profile and home management

Protected routes use `PrivateRoute` wrapper that checks authentication and home membership before allowing access.

## 🧮 Simulation Algorithm

The emission simulation (`Backend/src/services/simulationService.js`) generates realistic 24-hour emission profiles:

### Key Parameters

- **Appliance energy ratings** (kWh per hour of use) — e.g., AC: 1.5 kWh/h, Refrigerator: 0.15 kWh/h
- **Daily usage hours** — total hours each appliance runs per day
- **Usage windows** — peak times when appliance is likely to be used (e.g., AC: 12:00-22:00)
- **Emission factor** — gCO2 per kWh for the home's location (from Climatiq API)

### Simulation Process

1. For each appliance in the home:
   - Calculate usage probability distribution across 24 hours based on usage windows
   - Apply seasonal multipliers (heating higher in winter, cooling in summer)
   - Apply weekend multipliers (different patterns on weekends)
   - Distribute daily usage hours across the 24-hour period
   - Add 10% random noise for realism
2. For each hour (0-23):

   - Calculate kWh consumed = (usage probability × daily hours × energy rating × appliance count)
   - Convert to grams CO2 = kWh × emission factor × 1000 × seasonal × weekend
   - Sum across all appliances to get total hourly emission

3. Store results in `HourlyEmission` document:
   - `emissions`: Map of appliance → [24 hourly values in grams]
   - `totalHourly`: [24 values] sum across all appliances
   - `summary.totalEmissions`: sum of all 24 hours
   - `summary.topAppliance`: appliance with highest total

### Edge Cases

- **No appliances**: Creates a zero-filled placeholder doc with `no_appliances` key to maintain data continuity
- **Missing emission factor**: Falls back to global average (0.475 kgCO2/kWh)
- **Validation**: Pre-save hook recomputes summary if emissions change

## 🤖 AI Insights Generation

The insights feature (`Backend/src/services/insightService.js`) uses Google Gemini to generate personalized recommendations:

### Prompt Engineering

The service builds a detailed prompt including:

- Home's appliance inventory and counts
- Today's total emissions and top contributor
- Weekly trend (7-day totals and top appliances)
- Monthly trend (30-day totals and top appliances)
- Comparison vs global average (home avg vs all homes avg)

### Generation Flow

1. Fetch dashboard data (today, week, month, comparison)
2. Build structured prompt with examples and constraints:

   - Request 10 concise insights (title + description)
   - Specify output format as JSON array
   - Include impact level (high/medium/low)
   - Add relevant tags (appliance, timing, cooling, etc.)
   - Enforce brevity (max 2 sentences per description)
   - Forbid vague CTAs ("optimize usage" etc.)

3. Call Gemini API (`gemini-1.5-flash` model)
4. Parse JSON response with error handling
5. For each insight:
   - Compute deterministic `sourceId` (SHA1 hash of title)
   - Normalize `generatedAt` to UTC day
   - Upsert to DB (unique on `{homeId, sourceId, generatedAt}`)

### Deduplication

- Each insight gets a `sourceId` derived from its title
- Same insight generated on same day = same sourceId → upsert (no duplicates)
- Different day = different `generatedAt` → new record (allows tracking insight history)

### Fallback Behavior

- If Gemini API is unavailable or returns invalid JSON, the service throws an error
- Scheduler catches errors and continues to next home
- Frontend shows last successfully generated insights (persisted in DB)

## 🎨 Design Features

### UI/UX

- **Custom color palette** with green theme (primary, secondary, neutral)
- **Responsive design** for mobile, tablet, and desktop
- **Animated decorative elements** (sun, stars, plants) on landing page
- **Toast notifications** (Sonner) for user feedback
- **Modal dialogs** (shadcn/ui) for confirmations
- **Loading states** and skeletons for async operations
- **3D button effects** with shadow/transform on active state
- **Collapsible sidebar** with hover effects and smooth transitions
- **Dark mode support** (via Tailwind CSS dark: variants)

### Charts & Visualizations

- **Interactive tooltips** showing exact values on hover
- **Responsive legends** with click-to-toggle series
- **Color-coded data** (green for good, red for high usage)
- **Animated transitions** when data updates
- **Gradient fills** for area charts
- **Custom tick formatters** for dates and numbers

### Accessibility

- **Keyboard navigation** support
- **Focus visible** styles for keyboard users
- **Screen reader** friendly component structure

## 🔄 Onboarding Flow

1. **Landing Page** - Google OAuth login
2. **Home Selection** - Choose to create or join home
3. **Create Home Path:**
   - Location selection (country, state, city)
   - Home details (rooms, appliances)
   - Success modal with home code
4. **Join Home Path:**
   - Enter home code
   - Success modal with home details

## 🐛 Common Issues & Solutions

### MongoDB Connection Timeout

- Whitelist your IP address in MongoDB Atlas
- Or use `0.0.0.0/0` for testing (not recommended for production)

### Climatiq API 403 Forbidden

- Verify your API key is valid
- Check your plan supports the requested features
- Some regions may not be available in free tier

### Google OAuth Not Working

- Verify callback URL in Google Console matches your backend URL
- Check `CLIENT_URL` in backend .env matches frontend URL
- Ensure cookies are enabled in browser
- For production, set `sameSite: 'none'` and `secure: true` in cookie options

### Insights Not Generating

- Verify `GEMINI_API_KEY` is set in backend `.env`
- Check Gemini API quota/limits in Google Cloud Console
- Run `node scripts/run_insight_for_home.js` to test generation
- Check backend logs for prompt/response details

### Missing Daily Emission Data

- Run backfill script: `node scripts/backfill_emissions.js`
- Check if homes have appliances configured (count > 0)
- Verify scheduler is running (check console logs at midnight IST)
- Manually trigger simulation via API if needed

### High Global Average in Comparison

- This was a bug fixed in v1.1 — global avg now divides by (total homes × days)
- Update to latest code if seeing unrealistic values
- Global avg represents average per-home per-day emissions across all homes

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 👥 Authors

- **Ved Rathavi** - [vedrathavi](https://github.com/vedrathavi)

## 🚀 Deployment

### Backend Deployment (Render / Railway / Heroku)

1. Set all environment variables in your hosting platform
2. Ensure MongoDB is accessible (whitelist hosting IP or use 0.0.0.0/0 for testing)
3. Set `CLIENT_URL` to your deployed frontend URL
4. Enable cookies with `sameSite: 'none'` and `secure: true` for cross-origin
5. Start command: `node server.js`

### Frontend Deployment (Vercel / Netlify)

1. Set `VITE_SERVER_URL` environment variable to your backend URL
2. Build command: `npm run build`
3. Output directory: `dist`
4. Ensure CORS is properly configured in backend

### Production Checklist

- [ ] Set strong `JWT_SECRET` (min 32 random characters)
- [ ] Whitelist specific IPs in MongoDB Atlas (or use 0.0.0.0/0 temporarily)
- [ ] Configure Google OAuth with production callback URLs
- [ ] Set `NODE_ENV=production` in backend
- [ ] Enable cookie security (`sameSite: 'none'`, `secure: true`)
- [ ] Set up monitoring/logging (optional: Sentry, LogRocket)
- [ ] Test OAuth flow end-to-end in production
- [ ] Verify scheduler runs at expected times
- [ ] Test insights generation with real API key

### Environment-Specific Notes

**Development:**

- Frontend runs on `http://localhost:5173`
- Backend runs on `http://localhost:5000`
- Cookies use `sameSite: 'lax'` and `secure: false`

**Production:**

- Frontend and backend on different domains (CORS configured)
- Cookies must use `sameSite: 'none'` and `secure: true`
- HTTPS required for secure cookies

## 🔒 Security Considerations

- **JWT tokens** stored in HTTP-only cookies (not accessible via JavaScript)
- **CORS** configured to allow only `CLIENT_URL` origin
- **Emission factors** cached to reduce external API calls
- **User data** encrypted in transit (HTTPS in production)
- **MongoDB connection** uses secure connection string
- **OAuth secrets** never exposed to frontend
- **API rate limiting** recommended for production (not yet implemented)

## 📈 Performance Optimizations

- **Lazy loading** for dashboard charts and sections
- **Memoized components** (React.memo) for expensive renders
- **Zustand selectors** to prevent unnecessary re-renders
- **MongoDB indexes** on frequently queried fields (`homeId`, `date`, `userId`)
- **Unique compound indexes** to prevent duplicates and speed up lookups
- **Cron job throttling** with small delays between homes
- **API response caching** (emission factors cached in DB)

## 🧪 Testing & Quality Assurance

The frontend now includes a comprehensive Vitest test suite covering components, hooks, utilities, boundary conditions, and documented technical debt via intentional failing tests. Backend tests are still pending and outlined below as next steps.

### Frontend Test Stack

- **Runner**: Vitest (`vitest`, `@vitest/ui` for interactive mode)
- **DOM Environment**: `happy-dom` (fast JSDOM alternative)
- **Rendering & Interaction**: `@testing-library/react` + `@testing-library/user-event`
- **Matchers**: `@testing-library/jest-dom`
- **Coverage**: `vitest --coverage` (Istanbul reports)

### Scripts

Run from `frontend/`:

```bash
npm run test          # Headless CLI tests
npm run test:ui       # Interactive UI at http://localhost:<port>/__vitest__/
npm run test:coverage # Generate coverage summary
```

### Current Coverage Focus

- Components: Rendering, conditional states, formatting, empty/fallback UI.
- Hooks & Stores: Zustand slice behavior, auth/home state transitions.
- Utilities: Deterministic helpers (`cn`, constants, API client config).
- Boundary Tests: Extreme numeric values (0, negative, large, `NaN`, `Infinity`), percentage diffs, zero appliance scenarios, data absence resiliency.
- Intentional Failing Tests: Explicitly marked with `it.fails(...)` to document known limitations (accessibility gaps, performance assumptions, missing validation). These are expected to FAIL; Vitest inverts success semantics so a failure counts as a “handled” case. If one of these tests unexpectedly passes, the suite reports an "Unexpected test pass" prompting review.

#### Interpreting Pass Counts

When the summary shows all tests passing (e.g. `96 passed`), intentional failing tests have correctly failed inside their `it.fails` blocks. Treat this as: "All standard expectations met and all known issues remain documented." If an intentional failing test starts passing, reassess whether the limitation has been resolved and either convert it to a normal test or remove it.

#### Example Intentional Failing Pattern

```ts
it.fails("lacks ARIA roles for charts", () => {
  // Expecting improved accessibility in future; current absence should trigger failure
  expect(screen.getByRole("figure")).toBeInTheDocument(); // Will fail until role added
});
```

### Backend Testing Roadmap (Planned)

- Unit tests: `simulationService`, `dashboardService`, `emissionFactorService` logic (edge cases & error paths).
- Integration tests: Key routes (auth, emission generation, insights) via `supertest` + in-memory Mongo (or test DB).
- Mocks/Stubs: External APIs (Climatiq, Gemini) to ensure deterministic responses.
- Load/Schedule Tests: Cron job execution resilience and idempotency (simulate multiple runs).

### Future QA Enhancements

- Accessibility automated checks (axe / playwright-axe)
- Visual regression (Chromatic or Playwright snapshots)
- Mutation testing (Stryker) for critical logic robustness
- Performance budgets (Lighthouse CI) & store update profiling
- Security scanning (dependency & minimal secrets exposure tests)

If you contribute tests, follow existing patterns in `frontend/tests/` and prefer:

- Clear arrange / act / assert sections
- Minimal mocking; test observable behavior
- One primary expectation per test where practical
- Descriptive test names reflecting user-facing outcomes

Backend test scaffolding is welcome—open a PR with a focused first suite (e.g. emission factor caching) before broad coverage.

## 🔮 Future Enhancements

- [ ] Real-time updates via WebSockets/Socket.io
- [ ] Mobile app (React Native)
- [ ] Push notifications for high usage alerts
- [ ] Goal setting and gamification
- [ ] Social features (compare with friends)
- [ ] More appliance types and custom appliances
- [ ] Historical data export (CSV/PDF)
- [ ] Multi-language support (i18n)
- [ ] Advanced analytics (ML predictions, anomaly detection)
- [ ] Integration with smart home devices (real-time data)
- [ ] Carbon offset marketplace integration
- [ ] Community forums and tips sharing
- [ ] Admin dashboard for super admins

## 🙏 Acknowledgments

- [Climatiq](https://www.climatiq.io/) for emission factor data
- [Google Gemini](https://ai.google.dev/) for AI-powered insights
- [shadcn/ui](https://ui.shadcn.com/) for beautiful UI components
- [Recharts](https://recharts.org/) for responsive chart library
- [REST Countries API](https://restcountries.com/) for country data
- All open-source contributors whose libraries made this project possible

---

Made with ❤️ for a sustainable future 🌱

**Star ⭐ this repo if you found it helpful!**
