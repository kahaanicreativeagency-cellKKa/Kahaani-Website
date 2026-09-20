# Kahaani — Backend & API Documentation

This is the production-ready Node.js + Express backend for **Kahaani — Your Brand. Your Story.**

It connects the existing contact form to a secure server API, validates submissions, synchronizes every enquiry to **Formspree**, saves leads to a **Supabase** PostgreSQL database with enquiry statuses, sends **email notifications**, and enforces rate limiting & spam prevention.

---

## 📁 Project Structure

```
kahaani-site/
├── .env                     # Your local secrets and configurations (ignored by git)
├── .env.example             # Configuration template
├── .gitignore               # Excluded files (node_modules, .env)
├── package.json             # Dependencies and npm scripts
├── server.js                # Server entry point
├── README.md                # Setup & deployment guide
├── src/
│   ├── app.js               # Express app, security middleware, static file serving
│   ├── config/
│   │   ├── supabase.js      # Supabase database client and enquiry insert logic
│   │   └── mailer.js        # Nodemailer transporter & responsive email template
│   ├── controllers/
│   │   └── enquiryController.js # Handles submissions, DB save, Formspree sync & emails
│   ├── db/
│   │   └── schema.sql       # Supabase database table creation script & RLS policies
│   ├── middleware/
│   │   ├── errorHandler.js  # 404 and 500 JSON error handling
│   │   ├── rateLimiter.js   # IP rate limiting (10 submissions per 15 min window)
│   │   └── validator.js     # Input validation, honeypot spam filter & sanitization
│   ├── routes/
│   │   └── enquiryRoutes.js # API route definitions (/api/enquiries, /api/health)
│   └── services/
│       └── formspreeService.js # Formspree sync service
└── kahaani/
    ├── index.html           # Frontend website (HTML, CSS, JS)
    └── images/              # Portfolio photography & assets
```

---

## 🚀 Quick Start in 3 Steps

### Step 1: Install Dependencies

In your terminal, navigate to this project folder and run:

```bash
npm install
```

### Step 2: Start the Server

Run the development server:

```bash
npm run dev
```
*(Or `npm start` for production mode)*

### Step 3: Open the Website

Open your browser and navigate to:
```
http://localhost:5000
```

* **Frontend Website**: `http://localhost:5000`
* **API Endpoint**: `http://localhost:5000/api/enquiries`
* **Health Check**: `http://localhost:5000/api/health`

---

## 🗄️ Supabase Database Setup

To store your enquiries in Supabase with status tracking:

1. **Create an account / project**:
   * Go to [https://supabase.com](https://supabase.com) and click **Start your project** (Free).
   * Name your project (e.g., `kahaani-db`), choose a strong database password and select the nearest region (e.g., Mumbai / South Asia).

2. **Run the Database Schema**:
   * In your Supabase project dashboard, click **SQL Editor** on the left menu.
   * Click **+ New query**.
   * Open [`src/db/schema.sql`](src/db/schema.sql), copy all lines, paste them into the SQL editor, and click **Run**.
   * You will see the `enquiries` table created with columns: `id`, `created_at`, `name`, `business_name`, `phone`, `email`, `preferred_contact`, `services`, `message`, and `status` (`New`, `Contacted`, `Converted`, `Lost`).

3. **Get your API Keys**:
   * In Supabase, go to **Project Settings** (gear icon) -> **API**.
   * Copy the **Project URL** and paste it into `.env` as `SUPABASE_URL`.
   * Copy the **anon / public key** (or **service_role key**) and paste it into `.env` as `SUPABASE_ANON_KEY`.

---

## 📋 Formspree Synchronization

* All enquiries are automatically forwarded to your new Formspree link:
  `https://formspree.io/f/xrpbbnyv`
* You can view and manage every incoming lead in your Formspree dashboard at any time.

---

## 📧 Email Notification Setup (Nodemailer)

When a client submits an enquiry, a branded email alert is dispatched with client details, service choices, and quick one-click WhatsApp/Call buttons.

### Option A: Using Gmail (Fastest for testing)
1. In your Google Account, enable **2-Step Verification**.
2. Go to [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords).
3. Create an App Name (e.g., "Kahaani Website") and copy the 16-character App Password.
4. Add to `.env`:
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your-gmail-address@gmail.com
   SMTP_PASS=your-16-char-app-password
   KAHAANI_NOTIFICATION_EMAIL=your-recipient-email@kahaani.in
   ```

*(Note: If SMTP credentials are empty during initial local testing, the backend will gracefully log full email contents to your console without failing).*

---

## 🔒 Security & Spam Protection

1. **Invisible Honeypot (`_gotcha`)**: An invisible field is embedded in the form. Spambots automatically fill this out and their submissions are immediately dropped without cluttering your database or email.
2. **Server-Side Validation**: Sanitizes and enforces format rules for phone numbers, services array, and strings using `validator`.
3. **Rate Limiting**: Protects your endpoints from flooding attacks (10 submissions per 15 minutes per IP address).
4. **Helmet Security Headers**: Automatically applies HTTP security headers.

---

## ☁️ Deployment Guide (Render, Railway, or VPS)

This project is configured as a **single unified app** (Express serves both the API and the static frontend):

1. Push this project to GitHub.
2. Create a new Web Service on **Render** (or **Railway**).
3. Set **Build Command**: `npm install`
4. Set **Start Command**: `npm start`
5. Add the Environment Variables from your `.env` file into the host's environment settings.
6. Done! Your entire site and backend will be live with full SSL and custom domain support.

# Kahaani-Website
