<p align="center">
  <img src="/public/images/hero-page-ui.png" alt="Ubuntu Cafe & Lounge UI Screenshot" width="800"/>
</p>

<h1 align="center">Ubuntu Cafe & Lounge (Smart Cafe Platform)</h1>

<p align="center">
  <a href="https://github.com/s-aduk/ubuntu-smart-cafe">
    <img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT">
  </a>
  <a href="https://github.com/s-aduk/ubuntu-smart-cafe/commits/main">
    <img src="https://img.shields.io/github/last-commit/s-aduk/ubuntu-smart-cafe" alt="Last Commit">
  </a>
  <a href="https://github.com/s-aduk/ubuntu-smart-cafe/issues">
    <img src="https://img.shields.io/github/issues/s-aduk/ubuntu-smart-cafe" alt="Issues">
  </a>
  <a href="https://github.com/s-aduk/ubuntu-smart-cafe/pulls">
    <img src="https://img.shields.io/github/issues-pr/s-aduk/ubuntu-smart-cafe" alt="Pull Requests">
  </a>
</p>

<p align="center">
  A premium, culture-inspired full-stack application designed to modernize the cafe and lounge experience. This project bridges a high-performance, responsive user interface with a robust, scalable serverless cloud architecture.
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#project-structure">Project Structure</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#deployment">Deployment</a> •
  <a href="#brand-tokens">Brand Tokens</a> •
  <a href="#smart-cafe-flow">Smart Cafe Flow</a>
</p>

---

## 🌟 Features

- **Responsive Design** - Works beautifully on mobile, tablet, and desktop
- **Light & Dark Mode** - Premium theme toggle (Tailwind class-based dark mode + next-themes), persisted across visits, smooth CSS transitions between looks
- **Dish Photography** - Every menu item has a hi-res image with hover-zoom, on both the home menu and the order page
- **Interactive Menu** - Browse dishes, customize quantities, and add to cart
- **Order Management** - Seamless checkout process with a loading state, order confirmation, and a graceful "backend offline" toast fallback
- **Admin Dashboard** - View and manage incoming orders (password-protected)
- **Reservation System** - UI-ready table booking form (backend integration pending)
- **Smart Cart State** - Shared cart context between menu browsing and order page
- **Static Export Optimized** - Ready for AWS S3 + CloudFront or AWS Amplify deployment
- **Self-hosted Fonts** - No external font requests for better performance
- **Brand-consistent Styling** - Custom color palette and typography, fully theme-aware

## 🛠️ Tech Stack

| Category          | Technology                                      |
|-------------------|-------------------------------------------------|
| **Framework**     | ![Next.js](https://img.shields.io/badge/Next.js-14.2-black?logo=next.js) |
| **Styling**       | ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?logo=tailwindcss) |
| **Language**      | ![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?logo=javascript) |
| **React**         | ![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react) |
| **Icons**         | ![Heroicons](https://img.shields.io/badge/Heroicons-1.0-10B981?logo=heroicons) |
| **Deployment**    | ![AWS](https://img.shields.io/badge/AWS-Amplify-FF9900?logo=awsamplify) |

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── layout.js           # Root layout (fonts, metadata, CartProvider)
│   ├── page.js             # Home page
│   ├── order/page.js       # Order submission page
│   └── admin/page.js       # Admin dashboard
├── components/             # Reusable UI components
│   ├── layout/             # Navbar, Footer, etc.
│   ├── features/           # Hero, UbuntuStory, Menu, etc.
│   ├── order/              # Order-specific components
│   └── admin/              # Admin Dashboard components
├── context/                # React Context (Cart state)
├── data/                   # Static menu data (API fallback)
├── utils/                  # API helpers & formatters
└── public/                 # Static assets
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation
```bash
# Clone the repository
git clone https://github.com/s-aduk/ubuntu-smart-cafe.git
cd ubuntu-smart-cafe

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit http://localhost:3000 to see the application running.

### Environment Variables
Create a `.env.local` file based on `.env.example`:
```bash
cp .env.example .env.local
```

Then add your values:
```
NEXT_PUBLIC_AWS_API_URL=your_api_gateway_url
NEXT_PUBLIC_ADMIN_PASSWORD=your_secure_password
```

> Until `NEXT_PUBLIC_AWS_API_URL` points at a real API Gateway endpoint, the
> app runs entirely on simulated data — placing an order or loading the
> admin dashboard will show a toast noting the AWS backend is offline,
> rather than breaking. See `src/utils/api.js` for the fallback logic.

## 📦 Available Scripts

| Command             | Description                                  |
|---------------------|----------------------------------------------|
| `npm run dev`       | Start development server at localhost:3000   |
| `npm run build`     | Build for production (static export to `/out`)|
| `npm run start`     | Start production server                      |
| `npm run lint`      | Run ESLint for code quality                  |

## ☁️ Deployment Options

### Option 1: AWS Amplify (Recommended)
1. Push repository to GitHub/GitLab/CodeCommit
2. In AWS Amplify Console, connect your repository
3. Set build command: `npm run build`
4. Set output directory: `out`
5. Deploy - Amplify serves static files via CDN

### Option 2: Amazon S3 + CloudFront
1. Build locally: `npm run build`
2. Sync to S3 bucket: `aws s3 sync out/ s3://YOUR_BUCKET_NAME --delete`
3. Configure CloudFront distribution in front of S3 bucket
4. Set default root object to `index.html`

> 📘 For the full system architecture diagram, the exact API data contract
> the backend team needs to implement, and a phased checklist for
> provisioning DynamoDB/Lambda/API Gateway and going live on Amplify, see
> **[AWS_DEPLOYMENT_GUIDE.md](./AWS_DEPLOYMENT_GUIDE.md)**.

## 🎨 Brand Tokens

| Role                  | Color                          | Tailwind Key   | Usage Examples              |
|-----------------------|--------------------------------|----------------|-----------------------------|
| Background / Dark     | `#1A1A1A` (Deep Charcoal)      | `charcoal`     | Navbar, Footer backgrounds  |
| Primary Accent        | `#C85A32` (Burnt Terracotta)   | `terracotta`   | Buttons, Links, Highlights  |
| Light Background      | `#FDFBF7` (Premium Ivory)      | `ivory`        | Cards, Sections, Modals     |
| Secondary Accent      | `#2C4A3E` (Deep Emerald)       | `emerald`      | Secondary buttons, Icons    |
| Highlight / Borders   | `#D4AF37` (Soft Muted Gold)    | `gold`         | Dividers, Borders, Accents  |

**Typography:**
- Headings: **Playfair Display** (self-hosted via `next/font/google`)
- Body: **Plus Jakarta Sans** (self-hosted via `next/font/google`)

### 🌗 Dark & Light Mode

Theming uses Tailwind's class-based dark mode (`darkMode: 'class'` in
`tailwind.config.js`) driven by `next-themes`, wrapped once around the app
in `src/app/layout.js`. The visitor's choice persists in `localStorage`.

| Mode  | Background         | Text / Structural Accent | Primary Details        |
|-------|---------------------|---------------------------|--------------------------|
| Dark (default) | Deep Charcoal `#1A1A1A` | Soft Muted Gold `#D4AF37` | Terracotta `#C85A32` |
| Light | Premium Ivory `#FDFBF7` | Deep Emerald `#2C4A3E`    | Terracotta `#C85A32` |

Toggle it via the sun/moon icon in the Navbar (also present in the admin
header). Component classes follow Tailwind's `dark:` convention throughout
— e.g. `text-charcoal dark:text-ivory` — so the same rule applies
everywhere in the codebase. The Hero section is the one intentional
exception: it always renders light text over a permanent dark image
scrim, regardless of site-wide theme, since that reads better than
swapping a photographic hero to light mode.

## 🔄 Smart Cafe Flow

### 🛒 Cart State Management
- Centralized state via React Context (`CartContext`)
- Shared between homepage menu browsing and `/order` page
- Automatic synchronization of cart badge and order summary

### 🍽️ Order Process
1. Browse menu and add items to cart
2. Review cart and proceed to checkout
3. Enter customer information (name, phone, email)
4. Choose Dine-in (with table number) or Pickup
5. Submit order → shows spinner → success confirmation with Order ID (if the AWS backend isn't reachable yet, a toast notes "Order simulated successfully! (AWS Backend Offline)" instead of failing silently)
6. Cart automatically clears after successful order

### 👨‍💼 Admin Dashboard
- Access via `/admin` route (protected by client-side password)
- View incoming orders with real-time status updates
- Update order status: Pending → Preparing → Ready → Completed
- Pulls data through `src/utils/api.js` (falls back to simulated data until backend connected)

### 📝 Table Reservations
- UI-ready reservation form in `src/components/Reservations.jsx`
- Currently a placeholder - ready for backend integration
- Follow the same pattern as order submission for implementation

## ⚙️ Architecture Notes

### API Integration
All backend communication flows through `src/utils/api.js`, driven by
`NEXT_PUBLIC_AWS_API_URL`:
- `submitOrder()` - Places new orders
- `fetchOrders()` - Retrieves orders for admin dashboard
- `updateOrderStatus()` - Updates order processing status
- Every function returns a `simulated: true` flag when it had to fall back
  to mock data (missing env var, unreachable backend, non-2xx response),
  which the UI uses to show an honest toast rather than a silent success

### Static Export Configuration
- Built with `next.config.js`: `output: 'export'` for static hosting
- Images unoptimized (`images: { unoptimized: true }`) due to static nature
- Trailing slashes enabled for S3 static website compatibility
- No server-side rendering dependencies

### Security Note
⚠️ The admin password protection is currently client-side only. For production:
1. Replace with proper authentication (Amazon Cognito recommended)
2. Secure `/orders` API endpoints with authorizer
3. Never rely solely on frontend password protection for sensitive data

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Made with ❤️ for Ubuntu Cafe & Lounge
</p>