# Bhakti Steps Web Application

This is a React web application built with [Vite](https://vitejs.dev/), [TypeScript](https://www.typescriptlang.org/), and [Supabase](https://supabase.com/).

> **Note:** This project is a standard React Web application using Vite, not a React Native/Expo mobile app. You can run it in your browser following the web instructions below. 

## Exporting to GitHub

If the native "GitHub Integration" is showing as unavailable in your environment, you can export your project manually:

1. Look for an **Export** or **Download as ZIP** option in the AI Studio settings/menu.
2. Download the ZIP file to your computer and extract it.
3. Open your terminal in the extracted folder, and initialize a new git repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```
4. Create a new repository on GitHub.
5. Link your local repository to GitHub and push:
   ```bash
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git push -u origin main
   ```

## Running Locally

Once you have cloned or downloaded the project, follow these steps to run the application locally on your machine.

### 1. Install Dependencies

Make sure you have [Node.js](https://nodejs.org/) installed, then run:

```bash
npm install
```

### 2. Configure Environment Variables

The app relies on Supabase for data and authentication. You will need to set up your `.env` file for the app to function properly.

1. Copy the example `.env` file:
   ```bash
   cp .env.example .env
   ```
2. Open the newly created `.env` file and replace the placeholder values with your actual Supabase project credentials. You will need:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

### 3. Start the Development Server

Run the development server using:

```bash
npm run dev
```

This will start Vite on port `3000`. Open your browser and navigate to `http://localhost:3000` to view the application.

## Building for Production

To create a production build, run:

```bash
npm run build
```

This command will output the bundled files to the `dist/` directory, ready to be hosted on any static hosting provider.
