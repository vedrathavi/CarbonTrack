# CarbonTrack

A full-stack web application for tracking household energy consumption and carbon footprint.

## 🌟 Features

- **Google OAuth Authentication** - Secure login with Google accounts
- **Household Management** - Create or join existing households
- **Multi-step Onboarding** - Intuitive onboarding flow to set up your home
- **Country-based Emission Factors** - Automatic fetching of emission data from Climatiq API
- **Appliance Tracking** - Track various household appliances and their quantities
- **Real-time Data** - Live updates of household information

## 🛠️ Tech Stack

### Backend

- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **Passport.js** for Google OAuth authentication
- **JWT** for session management
- **Climatiq API** integration for emission factors

### Frontend

- **React** with Vite
- **React Router** for navigation
- **Zustand** for state management
- **shadcn/ui** components with Tailwind CSS
- **Axios** for API requests
- **Sonner** for toast notifications

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
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
CLIENT_URL=http://localhost:5173
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
CLIMATIQ_API_KEY=your_climatiq_api_key
CLIMATIQ_API_URL=https://api.climatiq.io/data/v1/estimate
PORT=5000
```

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

### Start Backend Server

```bash
cd Backend
node server.js
```

Backend will run on `http://localhost:5000`

### Start Frontend Development Server

```bash
cd frontend
npm run dev
```

Frontend will run on `http://localhost:5173`

## 📁 Project Structure

```
SDL Project/
├── Backend/
│   ├── src/
│   │   ├── controllers/      # Route controllers
│   │   ├── middleware/       # Authentication middleware
│   │   ├── models/           # Mongoose models
│   │   ├── routes/           # API routes
│   │   ├── services/         # Business logic & external APIs
│   │   └── utils/            # Utility functions
│   ├── server.js             # Entry point
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/       # Reusable UI components
    │   ├── pages/            # Page components
    │   ├── stores/           # Zustand state management
    │   ├── hooks/            # Custom React hooks
    │   ├── lib/              # API client & utilities
    │   └── utils/            # Constants & helpers
    ├── index.html
    └── package.json
```

## 🔐 Environment Variables

### Backend (.env)

| Variable               | Description                        |
| ---------------------- | ---------------------------------- |
| `MONGO_URI`            | MongoDB connection string          |
| `JWT_SECRET`           | Secret key for JWT tokens          |
| `CLIENT_URL`           | Frontend URL for CORS              |
| `GOOGLE_CLIENT_ID`     | Google OAuth Client ID             |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret         |
| `CLIMATIQ_API_KEY`     | Climatiq API key for emission data |
| `CLIMATIQ_API_URL`     | Climatiq API endpoint              |
| `PORT`                 | Server port (default: 5000)        |

### Frontend (.env)

| Variable          | Description     |
| ----------------- | --------------- |
| `VITE_SERVER_URL` | Backend API URL |

## 🌍 API Endpoints

### Authentication

- `GET /api/auth/google` - Initiate Google OAuth
- `GET /api/auth/google/callback` - OAuth callback
- `GET /api/auth/user` - Get current user info
- `GET /api/auth/logout` - Logout user

### Home Management

- `POST /api/home` - Create a new home
- `POST /api/home/join` - Join existing home by code
- `GET /api/home/me` - Get user's home details
- `PATCH /api/home` - Update home details (admin only)
- `GET /api/home/stats` - Get home statistics

### Emission Factors

- `GET /api/emission-factor?country=XX` - Get emission factor for country

## 📊 Data Models

### User

- Email, name, profile picture
- Household ID reference
- Google OAuth profile

### Home

- Unique home code (8 characters)
- Address (country, state, city)
- Total rooms
- Appliances with quantities
- Emission factor (gCO2/kWh as float)
- Members with roles (admin/member)

### EmissionFactor

- Country code (ISO 3166-1 alpha-2)
- Emission factor value (gCO2/kWh as float)
- Auto-cached from Climatiq API

## 🎨 Design Features

- Custom color palette with green theme
- Responsive design for mobile and desktop
- Animated decorative elements (sun, stars, plants)
- Toast notifications for user feedback
- Modal dialogs for confirmations
- Loading states for async operations

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

## 🙏 Acknowledgments

- [Climatiq](https://www.climatiq.io/) for emission factor data
- [shadcn/ui](https://ui.shadcn.com/) for UI components
- [REST Countries API](https://restcountries.com/) for country data

---

Made with ❤️ for a sustainable future 🌱
