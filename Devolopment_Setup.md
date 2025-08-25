# 🚀 Development Setup Guide


This guide will help you set up the Thunder project locally for development.


## 📋 Prerequisites


Before you begin, ensure you have the following installed:


- **Node.js**: Version 18.0.0 or higher ([Download](https://nodejs.org/))

- **npm**: Version 8.0.0 or higher (comes with Node.js)

- **Git**: Latest version ([Download](https://git-scm.com/))


### Verify Installation

```bash

node --version    # Should show v18.0.0 or higher

npm --version     # Should show 8.0.0 or higher

git --version     # Should show git version

🔧 Local Development Setup
1. Clone the Repository

bash

git clone https://github.com/subh37106/thunder.git

cd thunder

2. Backend Setup

Navigate to the backend directory:

bash

cd thunder/be

Install backend dependencies:

bash

npm install

Create environment file:

bash

cp .env.example .env

Configure your environment variables in .env:

env

GEMINI_API_KEY=your_gemini_api_key_here

Build and start the backend:

bash

npm run dev

The backend will run on http://localhost:3001 (or the port specified in your backend code).
3. Frontend Setup

Open a new terminal and navigate to the frontend directory:

bash

cd thunder/frontend

Install frontend dependencies:

bash

npm install

Create environment file:

bash

cp .env .env.local

Configure your environment variables in .env.local:

env

VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key

CLERK_SECRET_KEY=your_clerk_secret_key

CLERK_WEBHOOK_SECRET=your_clerk_webhook_secret

VITE_VERCEL_API_TOKEN=your_vercel_api_token

Start the frontend development server:

bash

npm run dev

The frontend will run on http://localhost:5173 (default Vite port).
🌐 Accessing the Application

Once both servers are running:

    Frontend: http://localhost:5173
    Backend API: http://localhost:3001

🔑 Environment Variables Setup
Backend Environment Variables (thunder/be/.env)

    GEMINI_API_KEY: Get from Google AI Studio

Frontend Environment Variables (thunder/frontend/.env.local)

    VITE_CLERK_PUBLISHABLE_KEY: Get from Clerk Dashboard
    CLERK_SECRET_KEY: Get from Clerk Dashboard
    CLERK_WEBHOOK_SECRET: Get from Clerk Dashboard
    VITE_VERCEL_API_TOKEN: Get from Vercel Dashboard

🛠️ Development Commands
Backend Commands

bash

cd thunder/be

npm run dev     # Start development server with TypeScript compilation

Frontend Commands

bash

cd thunder/frontend

npm run dev     # Start Vite development server

npm run build   # Build for production

npm run preview # Preview production build

npm run lint    # Run ESLint

🔍 Troubleshooting
Common Issues and Solutions
1. Port Already in Use

Issue: Error: listen EADDRINUSE: address already in use :::5173 Solution:

    Kill the process using the port: npx kill-port 5173
    Or use a different port: npm run dev -- --port 3000

2. Node Version Issues

Issue: error: unsupported engine Solution:

    Use Node Version Manager: nvm use 18 or nvm install 18
    Or update Node.js to version 18+

3. TypeScript Compilation Errors

Issue: Backend TypeScript compilation fails Solution:

bash

cd thunder/be

rm -rf dist/

rm tsconfig.tsbuildinfo

npm run dev

4. Clerk Authentication Issues

Issue: Authentication not working Solution:

    Verify all Clerk environment variables are set
    Check that the publishable key starts with pk_test_ or pk_live_
    Ensure webhook secret starts with whsec_

5. API Connection Issues

Issue: Frontend cannot connect to backend Solution:

    Ensure backend is running on the correct port
    Check for CORS issues in browser console
    Verify API endpoints in frontend configuration

6. Dependencies Installation Issues

Issue: npm install fails Solution:

bash

# Clear npm cache

npm cache clean --force


# Remove node_modules and reinstall

rm -rf node_modules

rm package-lock.json

npm install

📝 Development Workflow

    Start Development: Always run backend first, then frontend
    Making Changes:
        Backend changes require restart (Ctrl+C then npm run dev)
        Frontend changes auto-reload with Vite
    Testing: Test in browser at http://localhost:5173
    Committing: Run npm run lint in frontend before committing

🤝 Getting Help

If you encounter issues not covered here:

    Check the GitHub Issues
    Create a new issue with detailed error logs
    Join our community discussions

🚀 Next Steps

After successful setup:

    Explore the codebase structure
    Check out our Contributing Guidelines
    
    Review the Project Documentation

