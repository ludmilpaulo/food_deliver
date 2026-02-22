# Kudya - Food Delivery & E-Commerce Web App

Next.js web application for customers to browse stores, shop for products, and order food delivery.

## Overview

This is the customer-facing web application for the Kudya platform. Built with Next.js 15, React 18, and TypeScript, it provides a modern, responsive, and performant shopping experience.

## Features

- 🏪 Browse stores and restaurants
- 🛒 Shopping cart with real-time updates
- 📦 Product catalog with filters and search
- 🗺️ Location-based store discovery with maps
- 📍 Google Maps integration
- 💳 Secure checkout process
- 👤 User authentication and profiles
- 📱 Responsive design (mobile, tablet, desktop)
- 🌍 Internationalization (i18n) support
- 🔔 Real-time order tracking
- ⭐ Product reviews and ratings
- ❤️ Wishlist functionality
- 📊 User dashboard and order history
- 🎨 Modern UI with Tailwind CSS
- ⚡ Optimized performance with Next.js 15

## Tech Stack

- **Framework**: Next.js 15.3.3
- **UI Library**: React 18.3.1
- **Language**: TypeScript 5.3.3
- **Styling**: Tailwind CSS 3.4.3
- **State Management**: Redux Toolkit 2.2.6
- **Maps**: React Google Maps API, Leaflet, Mapbox
- **Animations**: Framer Motion 11.2.4
- **Forms**: React Hook Form 7.51.5
- **API Client**: Axios 1.7.1
- **Rich Text**: CKEditor 5
- **PWA**: next-pwa 5.6.0

## Prerequisites

- Node.js 18+ and npm/yarn/pnpm/bun
- Git

## Installation

1. **Clone the repository**:
```bash
git clone https://github.com/ludmilpaulo/food_deliver.git
cd food_deliver
```

2. **Install dependencies**:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. **Set up environment variables**:

Create a `.env.local` file in the root directory:
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
# API Configuration
NEXT_PUBLIC_BASE_API=http://127.0.0.1:8000
# For production: https://www.kudya.store

# Google Maps API Key
NEXT_PUBLIC_GOOGLE_API_KEY=your_google_maps_api_key

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. **Update API configuration** (if needed):
Edit `services/types.ts`:
```typescript
export const baseAPI: string = "https://www.kudya.store";
```

## Running the App

### Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
# Build for production
npm run build

# Start production server
npm run start
```

### Linting

```bash
npm run lint
```

## Project Structure

```
food_deliver/
├── app/                 # Next.js App Router pages
│   ├── layout.tsx       # Root layout
│   ├── page.tsx         # Home page
│   ├── stores/          # Store listing and details
│   ├── products/        # Product pages
│   ├── cart/            # Shopping cart
│   ├── checkout/        # Checkout flow
│   └── dashboard/       # User dashboard
├── components/          # Reusable React components
│   ├── ui/              # UI components
│   ├── layout/          # Layout components
│   ├── store/           # Store components
│   └── product/         # Product components
├── configs/             # App configuration
│   ├── i18n.ts          # Internationalization
│   └── translations.ts  # Translation strings
├── hooks/               # Custom React hooks
├── public/              # Static assets
├── redux/               # Redux store and slices
│   ├── store.ts         # Store configuration
│   └── slices/          # Redux slices
├── services/            # API services
│   ├── api.ts           # Axios instance
│   ├── apiService.ts    # API calls
│   ├── authService.ts   # Authentication
│   └── types.ts         # TypeScript types
├── utils/               # Utility functions
├── .env.local           # Environment variables (not committed)
├── .env.production      # Production environment
├── next.config.js       # Next.js configuration
├── tailwind.config.ts   # Tailwind CSS config
└── package.json         # Dependencies
```

## Integration with Backend

This app connects to the Kudya Django REST API:
- **Backend Repository**: [www_kudya_shop](https://github.com/ludmilpaulo/www_kudya_shop)
- **API Base URL**: `https://www.kudya.store`

### Key API Endpoints Used

- `/store/stores/` - List stores
- `/store/products/` - List products
- `/store/store-categories/` - Store categories
- `/customer/signup/` - User registration
- `/conta/login/` - User login
- `/customer/customer/order/add/` - Create order
- `/customer/customer/profile/` - User profile
- `/customer/customer/order/history/` - Order history

## Environment Variables

Create a `.env.local` file (see `.env.example`):

```env
# Required
NEXT_PUBLIC_BASE_API=https://www.kudya.store
NEXT_PUBLIC_GOOGLE_API_KEY=your_api_key

# Optional
NEXT_PUBLIC_APP_URL=https://www.sdkudya.com
```

## Deployment

### Vercel (Recommended)

The easiest way to deploy is using [Vercel](https://vercel.com):

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

### Other Platforms

You can also deploy to:
- **Netlify**: `npm run build` → Deploy `out/` or `.next/`
- **AWS Amplify**: Connect GitHub repository
- **Docker**: Create Dockerfile with Node.js

## Progressive Web App (PWA)

The app includes PWA support via `next-pwa`:

- Offline functionality
- Install on home screen
- Push notifications (when configured)

## Features in Detail

### Maps Integration

Three map providers are supported:
1. **Google Maps** - Primary (requires API key)
2. **Leaflet** - Open-source alternative
3. **Mapbox** - Advanced features

### Authentication

User authentication flow:
- Email/password signup
- Login with JWT tokens
- Password reset
- Profile management

### Shopping Cart

- Redux-based state management
- Persistent cart (localStorage)
- Real-time price calculations
- Multiple store support

### Checkout

- Address autocomplete
- Payment method selection
- Order confirmation
- Email notifications

## Related Projects

Part of the Kudya ecosystem:

1. **[www_kudya_shop](https://github.com/ludmilpaulo/www_kudya_shop)** - Django REST API Backend
2. **[kudya-client](https://github.com/ludmilpaulo/kudya-client)** - Customer Mobile App (React Native)
3. **[KudyaParceiro](https://github.com/ludmilpaulo/KudyaParceiro)** - Partner/Driver Mobile App

## Troubleshooting

### Build Errors

```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules
npm install
```

### TypeScript Errors

```bash
# Check for type errors
npm run build
```

### Environment Variables Not Loading

- Ensure `.env.local` exists
- Restart dev server after changing env vars
- Check that variables start with `NEXT_PUBLIC_`

## Learn More

To learn more about Next.js:

- [Next.js Documentation](https://nextjs.org/docs)
- [Learn Next.js](https://nextjs.org/learn)
- [Next.js GitHub repository](https://github.com/vercel/next.js/)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

Copyright © 2025 Kudya. All rights reserved.

## Support

For support, email: ludmilpaulo@gmail.com

## Links

- **Website**: https://www.sdkudya.com
- **Backend API**: https://www.kudya.store
- **Customer Mobile App**: [kudya-client](https://github.com/ludmilpaulo/kudya-client)
- **Partner App**: [KudyaParceiro](https://github.com/ludmilpaulo/KudyaParceiro)
