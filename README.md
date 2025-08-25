# Thunder ⚡️  
*A modern drag‑and‑drop website builder*  

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)  
[![Live Demo](https://img.shields.io/website?down_color=red&down_message=Offline&label=Demo&up_color=blue&up_message=Live&url=https%3A%2F%2Fthunder-muneer.vercel.app)](https://thunder-muneer.vercel.app)  
![Version](https://img.shields.io/badge/version-1.0.0-blue)  
![Maintained](https://img.shields.io/badge/Maintained%3F-Yes-brightgreen.svg)  
![Contributions Welcome](https://img.shields.io/badge/Contributions-Welcome-orange)  

---

## 🌟 Table of Contents 📚  

- [Overview](#overview)  
- [Features](#features)  
  - [Core Functionality](#core-functionality)  
  - [Advanced Features](#advanced-features)  
- [Tech Stack](#tech-stack)  
- [Project Structure](#project-structure)  
- [Installation](#installation)  
  - [Quick Start](#quick-start)  
  - [Prerequisites](#prerequisites)  
  - [Setup](#setup)  
- [Usage](#usage)  
- [Contributing](#contributing)  
- [License](#license)  
- [Support](#support)  

---

## 🖼️ Overview  

**Thunder** is a modern, intuitive **website builder** with drag‑and‑drop functionality, empowering users to create professional websites in minutes.  

![Thunder Muneer Interface](https://raw.githubusercontent.com/Muneerali199/website-builder/main/public/assets/sc.png)  

---

## ✨ Features  

### 🚀 Core Functionality  
- 🖱️ **Drag-and-Drop Builder** – Intuitive editor for seamless site creation.  
- 🎨 **Template Gallery** – Choose from 50+ responsive templates.  
- 📱 **Cross-Device Preview** – Real-time previews for desktop, tablet, and mobile.  
- 🌈 **Style Customizer** – Full CSS & theme variable support.  

### 🔧 Advanced Features  
- 🌍 **One-Click Deployment** – Deploy to a custom domain instantly.  
- 🤝 **Team Collaboration** – Real-time co-editing for teams.  
- 🕒 **Version History** – Roll back changes at any time.  
- 📊 **Integrated Analytics** – Track performance within the builder.  

---

## 💻 Tech Stack  

| Category           | Technologies                          |  
|--------------------|---------------------------------------|  
| **Frontend**       | React + Vite, TypeScript, TailwindCSS |  
| **Backend**        | Node.js, Express, Socket.IO           |  
| **Authentication** | Clerk                                 |  
| **Deployment**     | Vercel, Render                        |  
| **Testing**        | Jest, Cypress, Postman                |  

---

## 📂 Project Structure  


thunder/
│── be/ # Backend services
│ ├── src/ # API & WebSocket server code
│ └── package.json
│
│── frontend/ # Frontend (React + Vite)
│ ├── public/ # Static assets
│ ├── src/ # Components, pages, hooks, utils
│ │ ├── components/
│ │ ├── pages/
│ │ ├── hooks/
│ │ └── utils/
│ └── package.json
│
│── public/ # Screenshots, logos, assets
│── .env.example # Example environment variables
│── LICENSE
│── README.md
└── package.json

text

---

## 🛠️ Installation  
### Quick Start

For detailed setup instructions, see our **[Development Setup Guide](DEVELOPMENT_SETUP.md)**.


### Prerequisites  

- **Node.js** v18.0.0+  

- **npm** v8.0.0+  

- **Git** (latest)  


### Quick Setup  


1. **Clone and setup**  

```bash

git clone https://github.com/subh37106/thunder.git
cd thunder
npm install

## 2. Frontend setup

```bash

cd frontend
npm install
npm run dev

## 3. Backend setup (if needed)

```bash

cd be
npm install
npm run start


## 📖 Usage
Thunder makes it easy to create professional websites with no coding experience. Follow these steps to get started:

Access the Builder: Visit thunder-muneer.vercel.app and sign in with Clerk authentication.
Choose a Template: Select from 50+ responsive templates in the Template Gallery.
Customize Your Site: Use the drag-and-drop editor to add components, adjust styles, and preview across devices.
Deploy: Click the "Deploy" button to publish your site to a custom domain.
Collaborate: Invite team members for real-time co-editing.
Track Performance: Use integrated analytics to monitor site performance.

For detailed guides, visit thunder-docs.vercel.app.


## 🤝 Contributing
We welcome contributions to Thunder! To contribute:

Fork the Repository:

```bash 
git clone https://github.com/<your-username>/thunder.git



Set Up Locally: Follow the Installation instructions.


Create a Feature Branch:

```bash

git checkout -b feature/your-feature



Make Changes: Follow coding standards (TypeScript, TailwindCSS, ESLint).
Test: Run npm run test (Jest) and npm run cypress (Cypress) for code changes.
Submit a Pull Request: Push your branch and create a PR with a clear description.
Engage: Respond to feedback from maintainers.

For questions, contact alimuneerali245@gmail.com or open an issue.


## 📜 License  

This project is distributed under the **MIT License**.  
See [LICENSE](LICENSE) for details.  

---

## 💬 Support  

For help, suggestions, or issues:  
- 📧 Email: **alimuneerali245@gmail.com**  
- 🐞 [Open an Issue](https://github.com/Muneerali199/thunder/issues)  
- 💬 Join our *Discord* (coming soon 🚀)  

---

👨‍💻 Crafted with ❤️ by **Muneer Ali**  

📖 Docs: thunder-docs.vercel.app
🐞 Report Bug: [Issues](https://github.com/Muneerali199/thunder/issues)  
