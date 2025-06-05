# Kanglung-Dine

A restaurant management and reservation system for Kanglung area.

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL
- npm or yarn

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database Configuration
DATABASE_URL=your_database_url

# Session Configuration
SESSION_SECRET=your_session_secret

# Email Configuration
SMTP_HOST=your_smtp_host
SMTP_PORT=your_smtp_port
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password

# Node Environment
NODE_ENV=development
```

## Installation

1. Clone the repository:
```bash
git clone https://github.com/Tshering-ongmo/Kanglung-Dine.git
cd Kanglung-Dine
```

2. Install dependencies:
```bash
npm install
```

3. Set up the database:
```bash
npm run migrate
```

4. Start the development server:
```bash
npm run dev
```

## Deployment on Render

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Configure the following settings:
   - Build Command: `npm install`
   - Start Command: `npm start`
4. Add the required environment variables in the Render dashboard
5. Deploy!

## Features

- User authentication and authorization
- Restaurant management
- Reservation system
- Testimonials
- Admin dashboard
- Restaurant owner dashboard

## Tech Stack

- Node.js
- Express.js
- PostgreSQL
- Sequelize ORM
- EJS templating
- Express-session for authentication
- Nodemailer for email functionality