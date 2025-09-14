# Left2Feed - Food Sharing Platform

Turn Extra Meals into Extra Smiles - A modern web application that connects food donors with NGOs and shelters to reduce food waste and combat hunger.

## Features

- 🍽️ **Food Sharing**: List surplus food for pickup by verified NGOs
- 🤝 **Community Network**: Connect with local shelters and food banks
- 📱 **Mobile Optimized**: Responsive design for all devices
- 🌙 **Night Mode**: Dark/light theme support
- 🌍 **Multi-language**: Support for English, Hindi, Tamil, Telugu
- 🔒 **Secure**: Authentication with Google OAuth and email/password
- 📊 **Analytics**: Track your impact and community contributions

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth)
- **Icons**: Lucide React
- **Routing**: React Router DOM

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Firebase account

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd left2feed
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Add your Firebase credentials to `.env`:
```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

   **To get Firebase credentials:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project or select existing one
   - Go to Project Settings > General
   - Scroll to "Your apps" and click "Add app" > Web
   - Copy the config values to your `.env` file

5. Start the development server:
```bash
npm run dev
```

6. Open [http://localhost:5173](http://localhost:5173) in your browser.

## Project Structure

```
src/
├── components/          # Reusable UI components
├── contexts/           # React contexts (Auth, Theme, Language)
├── pages/              # Page components
├── lib/                # Utility functions
└── styles/             # Global styles

supabase/
├── migrations/         # Database migrations
└── config.toml        # Supabase configuration
```

## Database Setup

The project uses Firebase with Firestore. Set up your database:

1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login: `firebase login`
3. Initialize: `firebase init`
4. Deploy rules: `firebase deploy --only firestore`

## Deployment

The project is configured for deployment on Netlify:

```bash
npm run build
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, email hello@left2feed.com or join our community Discord.