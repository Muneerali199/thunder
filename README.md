# Thunder ⚡️ - Next.js with Supabase

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![Live Demo](https://img.shields.io/website?down_color=red&down_message=Offline&label=Demo&up_color=blue&up_message=Live&url=https%3A%2F%2Fthunder-muneer.vercel.app)](https://thunder-muneer.vercel.app)
![Version](https://img.shields.io/badge/version-2.0.0-blue)
![Maintained](https://img.shields.io/badge/Maintained%3F-Yes-brightgreen.svg)
![Contributions Welcome](https://img.shields.io/badge/Contributions-Welcome-orange)

A modern, intuitive **website builder** with drag-and-drop functionality, empowering users to create professional websites in minutes. Now built with **Next.js** and **Supabase** for enhanced performance and scalability.

---

## 🌟 Table of Contents 📚
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Environment Setup](#environment-setup)
- [Database Setup](#database-setup)
- [Usage](#usage)
- [Migration Notes](#migration-notes)
- [Contributing](#contributing)
- [License](#license)
- [Support](#support)

---

<h2 id="features">✨ Features</h2>

### 🚀 Core Functionality
- 🖱️ **Drag-and-Drop Builder** - Intuitive visual editor for seamless website creation
- 🎨 **Template Gallery** - Choose from 50+ responsive templates tailored for various industries
- 📱 **Cross-Device Preview** - Real-time simulation across devices
- 🌈 **Style Customizer** - Extensive support for CSS and theme variables

### 🔧 Advanced Features
- 🌍 **One-Click Deployment** - Publish your site to a custom domain effortlessly
- 🤝 **Team Collaboration** - Co-edit with your team in real time
- 🕒 **Version History** - Rollback to any previous version with ease
- 📊 **Analytics Integration** - Monitor traffic and performance directly from the builder

### 🔐 Authentication & Database
- 🔒 **Supabase Authentication** - Secure email/password authentication
- 💾 **Real-time Database** - PostgreSQL with real-time subscriptions
- 👤 **User Profiles** - Comprehensive user management
- 🔑 **Row Level Security** - Database-level security policies

---

<h2 id="tech-stack">💻 Tech Stack</h2> 

| 💡 Category       | 🔧 Technologies                          |
|-------------------|------------------------------------------|
| **Frontend**      | Next.js 14, React 18, TypeScript, Tailwind CSS |
| **Backend**       | Node.js, Express, Supabase Edge Functions |
| **Database**      | Supabase (PostgreSQL), Real-time subscriptions |
| **Authentication**| Supabase Auth                            |
| **Deployment**    | Vercel, Netlify                         |
| **Testing**       | Jest, Cypress                           |

---

<h2 id="installation">🛠️ Installation</h2>

### Prerequisites
- **Node.js** v18+ installed on your system
- **Supabase** account and project
- **Vercel CLI** (optional, for deployment)

### Quick Start Guide

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Muneerali199/thunder.git
   cd thunder
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.local.example .env.local
   ```

4. **Configure Supabase** (see Environment Setup below)

5. **Run database migrations**:
   ```bash
   # Apply the migration file in supabase/migrations/
   # This can be done through Supabase Dashboard or CLI
   ```

6. **Start the development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to access the builder!

---

## 🔧 Environment Setup

Create a `.env.local` file in the root directory with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Backend Configuration
NEXT_PUBLIC_BACKEND_URL=https://website-builder-backend-ws9k.onrender.com

# GitHub OAuth (optional)
NEXT_PUBLIC_GITHUB_CLIENT_ID=your_github_client_id

# Google Analytics
NEXT_PUBLIC_GA_ID=G-EQFZKPZ5MB
```

### Getting Supabase Credentials

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Create a new project or select existing one
3. Go to Settings > API
4. Copy the Project URL and anon/public key
5. For service role key, copy the service_role key (keep this secret!)

---

## 🗄️ Database Setup

### Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the content from `supabase/migrations/001_initial_schema.sql`
4. Run the migration

### Using Supabase CLI (Alternative)

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Apply migrations
supabase db push
```

---

## 🚀 Usage

### Development Mode
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

### Linting
```bash
npm run lint
```

---

## 📝 Migration Notes

This version has been migrated from:
- **Vite** → **Next.js 14** (App Router)
- **Clerk Authentication** → **Supabase Authentication**
- **Local Storage** → **Supabase Database**

### Key Changes:
- All authentication now uses Supabase Auth
- User data is stored in Supabase database with RLS policies
- Projects and chats are persisted in PostgreSQL
- Improved performance with Next.js SSR/SSG capabilities
- Better SEO with Next.js built-in optimizations

---

## 🤝 Contributing

We welcome contributions! To get started:

1. **Fork the repository**
2. **Create a feature branch**:
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. **Commit your changes**:
   ```bash
   git commit -m 'Add AmazingFeature'
   ```
4. **Push to your branch**:
   ```bash
   git push origin feature/AmazingFeature
   ```
5. **Open a Pull Request**

### Contribution Guidelines
- Follow the existing code style
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting

---

## 📜 License

Distributed under the MIT License. See [LICENSE](LICENSE) for more information.

---

## 💬 Support

For help or feature requests:
- 📧 Email: [alimuneerali245@gmail.com](mailto:alimuneerali245@gmail.com)
- 🐞 Open an [Issue](https://github.com/Muneerali199/website-builder/issues)
- 📚 Documentation: [Thunder Docs](https://thunder-docs.vercel.app/)

---

## 🔗 Links

- **Live Demo**: [thunder-muneer.vercel.app](https://thunder-muneer.vercel.app)
- **Documentation**: [thunder-docs.vercel.app](https://thunder-docs.vercel.app/)
- **GitHub**: [github.com/Muneerali199/website-builder](https://github.com/Muneerali199/website-builder)

---

Crafted with ❤️ by **Muneer Ali**

*Powered by Next.js, Supabase, and modern web technologies*