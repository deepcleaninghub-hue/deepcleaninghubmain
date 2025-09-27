# Deep Clean Mobile Hub

A comprehensive mobile application for professional cleaning and moving services, built with React Native and Node.js backend.

## 🚀 Features

### Mobile Apps (Android & iOS)
- **Service Catalog**: Browse cleaning, moving, assembly, and painting services
- **Category Filtering**: Filter services by category (Cleaning, Assembly, Moving, Painting)
- **Shopping Cart**: Add, remove, and manage services in your cart
- **User Authentication**: Secure login/signup with JWT tokens
- **Real-time Updates**: Live cart updates and service availability
- **Modern UI**: Beautiful, responsive design with React Native Paper

### Backend API
- **RESTful API**: Complete backend service with Express.js
- **User Management**: Secure authentication with JWT tokens
- **Database Integration**: Supabase PostgreSQL database
- **Cart Management**: Full CRUD operations for cart items
- **Service Management**: Dynamic service catalog with categories
- **Real-time Data**: Live updates and synchronization

## 📱 Screenshots

*Add screenshots of your mobile app here*

## 🛠️ Tech Stack

### Frontend (Mobile Apps)
- **React Native**: Cross-platform mobile development
- **Expo**: Development platform and tools
- **React Native Paper**: Material Design components
- **TypeScript**: Type-safe JavaScript
- **Context API**: State management
- **AsyncStorage**: Local data persistence

### Backend
- **Node.js**: JavaScript runtime
- **Express.js**: Web framework
- **Supabase**: Backend-as-a-Service
- **PostgreSQL**: Database
- **JWT**: Authentication tokens
- **bcryptjs**: Password hashing

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- Supabase account
- Android Studio (for Android development)
- Xcode (for iOS development)

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/deepcleaninghub-hue/deepclean-mobile-hub.git
cd deepclean-mobile-hub
```

### 2. Backend Setup
```bash
cd backend
npm install

# Create .env file
cp .env.example .env

# Update .env with your Supabase credentials
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
JWT_SECRET=your_jwt_secret

# Start the backend server
npm start
```

### 3. Mobile App Setup

#### Android App
```bash
cd android-app
npm install
npx expo start
```

#### iOS App
```bash
cd ios-app
npm install
npx expo start --port 8082
```

## 🗄️ Database Schema

### Tables
- **mobile_users**: User authentication and profile data
- **services**: Service catalog with categories and pricing
- **cart_items**: Shopping cart items for each user
- **service_bookings**: Service booking records

### Key Features
- UUID primary keys
- Foreign key relationships
- Automatic timestamps
- User authentication integration

## 🔧 API Endpoints

### Authentication
- `POST /api/mobile-auth/signup` - User registration
- `POST /api/mobile-auth/signin` - User login
- `GET /api/mobile-auth/profile` - Get user profile
- `PUT /api/mobile-auth/profile` - Update user profile

### Services
- `GET /api/services` - Get all services
- `GET /api/services/:id` - Get service by ID

### Cart
- `GET /api/cart/items` - Get user's cart items
- `POST /api/cart/items` - Add item to cart
- `PUT /api/cart/items/:id` - Update cart item
- `DELETE /api/cart/items/:id` - Remove cart item
- `GET /api/cart/summary` - Get cart summary

## 🎯 Usage

### For Users
1. **Register/Login**: Create an account or sign in
2. **Browse Services**: View available cleaning and moving services
3. **Filter by Category**: Use category filters to find specific services
4. **Add to Cart**: Add services to your shopping cart
5. **Manage Cart**: Update quantities or remove items
6. **Checkout**: Proceed to checkout (implementation pending)

### For Developers
1. **Backend Development**: Add new API endpoints in `/backend/src/routes/`
2. **Mobile Development**: Update screens in `/android-app/src/screens/` or `/ios-app/screens/`
3. **Database Changes**: Update schema in Supabase dashboard
4. **Styling**: Modify themes in `/utils/theme.ts`

## 🏗️ Project Structure

```
deepclean-mobile-hub/
├── backend/                 # Node.js backend API
│   ├── src/
│   │   ├── routes/         # API route handlers
│   │   ├── middleware/     # Express middleware
│   │   ├── config/         # Database configuration
│   │   └── utils/          # Utility functions
│   └── package.json
├── android-app/            # Android mobile app
│   ├── src/
│   │   ├── screens/        # App screens
│   │   ├── components/     # Reusable components
│   │   ├── contexts/       # React contexts
│   │   ├── services/       # API services
│   │   └── utils/          # Utility functions
│   └── package.json
├── ios-app/               # iOS mobile app
│   ├── src/               # Same structure as android-app
│   └── package.json
└── README.md
```

## 🔐 Environment Variables

### Backend (.env)
```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
JWT_SECRET=your_jwt_secret
PORT=5000
NODE_ENV=development
```

## 🚀 Deployment

### Backend Deployment
1. Deploy to Heroku, Vercel, or AWS
2. Set environment variables
3. Configure Supabase connection
4. Run database migrations

### Mobile App Deployment
1. Build production versions with Expo
2. Submit to Google Play Store (Android)
3. Submit to Apple App Store (iOS)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Backend Development**: Node.js, Express.js, Supabase
- **Mobile Development**: React Native, Expo, TypeScript
- **Database Design**: PostgreSQL, Supabase
- **UI/UX**: React Native Paper, Material Design

## 📞 Support

For support, email support@deepcleaninghub.com or create an issue in this repository.

## 🔄 Recent Updates

- ✅ Implemented real user authentication
- ✅ Added shopping cart functionality
- ✅ Fixed React Native Text component errors
- ✅ Added category filtering for services
- ✅ Integrated with Supabase database
- ✅ Added proper error handling and safety checks

## 🎉 Acknowledgments

- React Native community
- Expo team
- Supabase team
- React Native Paper contributors

---

**Built with ❤️ for the cleaning and moving industry**
