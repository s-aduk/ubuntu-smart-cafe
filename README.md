<p align="center">
  <img src="/images/hero-page-ui.png" alt="Ubuntu Cafe & Lounge UI Screenshot" width="800"/>
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
- **Interactive Menu** - Browse dishes, customize quantities, and add to cart
- **Order Management** - Seamless checkout process with order confirmation
- **Admin Dashboard** - View and manage incoming orders (password-protected)
- **Reservation System** - UI-ready table booking form (backend integration pending)
- **Smart Cart State** - Shared cart context between menu browsing and order page
- **Static Export Optimized** - Ready for AWS S3 + CloudFront or AWS Amplify deployment
- **Self-hosted Fonts** - No external font requests for better performance
- **Brand-consistent Styling** - Custom color palette and typography

## 🛠️ Tech Stack

| Category          | Technology                                      |
|-------------------|-------------------------------------------------|
| **Framework**     | ![Next.js](https://img.shields.io/badge/Next.js-14.2-black?logo=next.js) |
| **Styling**       | ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?logo=tailwindcss) |
| **Language**      | ![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?logo=javascript) |
| **React**         | ![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react) |
| **Icons**         | ![Heroicons](https://img.shields.io/badge/Heroicons-1.0-10B981?logo=heroicons) |
| **Deployment**    | ![AWS](https://img.shields.io/badge/AWS-S3%20%2B%20CloudFront-FF9900?logo=amazonaws) |

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
NEXT_PUBLIC_API_BASE_URL=your_api_gateway_url
NEXT_PUBLIC_ADMIN_PASSWORD=your_secure_password
```

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

## 🎨 Brand Tokens

| Role                  | Color                          | Tailwind Key   | Usage Examples              |
|-----------------------|--------------------------------|----------------|-----------------------------|
| Background / Dark     | `#1A1A1A` (Deep Charcoal)      | `charcoal`     | Navbar, Footer backgrounds  |
| Primary Accent        | `#C85A32` (Burnt Terracotta)   | `terracotta`   | Buttons, Links, Highlights  |
| Light Background      | `#FDFBF7` (Premium Ivory)      | `ivory`        | Cards, Sections, Modals     |
| Secondary Accent      | `#2C8FDFBF7` (Deep Emerald)       | `emerald`      | Secondary buttons, Icons    |
| Highlight / Borders   | `#D4AF37` (Soft Muted Gold)    | `gold`         | Dividers, Borders, Accents  |

**Typography:**
- Headings: **Playfair Display** (self-hosted via `next/font/google`)
- Body: **Plus Jakarta Sans** (self-hosted via `next/font/google`)

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
5. Submit order → shows spinner → success confirmation with Order ID
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
All backend communication flows through `src/utils/api.js`:
- `submitOrder()` - Places new orders
- `fetchOrders()` - Retrieves orders for admin dashboard
- `updateOrderStatus()` - Updates order processing status
- Includes simulated data fallback for development/testing

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