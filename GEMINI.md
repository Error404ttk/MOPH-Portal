# Gemini Project Analysis: MOPH Portal

## Project Overview

This project is a full-stack web application serving as a centralized portal for the Ministry of Public Health (MOPH) of Thailand. It provides organized links to various dashboards and services, features a responsive design, and includes an admin interface for content management.

**Architecture:**
The project is structured as a monorepo with two main parts: a frontend client and a backend server.

*   **Frontend:** A modern single-page application (SPA) built with **React** and **Vite**. It is written in **TypeScript** and uses the **Chakra UI** component library for its user interface, with icons from **Lucide React**.
*   **Backend:** A REST API server built with **Node.js** and the **Express** framework. It handles business logic, user authentication (using `bcryptjs` for password hashing), and serves data to the frontend.
*   **Database:** The backend connects to a **MySQL** database (inferred from the `mysql2` driver) to persist data.

## Building and Running

### 1. Dependency Installation

**Important:** Dependencies must be installed for both the root (frontend) and `server/` (backend) directories.

```bash
# 1. Install frontend dependencies
npm install

# 2. Install backend dependencies
cd server
npm install
cd ..
```

### 2. Development Environment

The frontend and backend must be run in separate terminals.

*   **Frontend (Vite Dev Server):**
    From the root directory, run:
    ```bash
    npm run dev
    ```
    The frontend will be available at `http://localhost:5173` by default.

*   **Backend (Nodemon Server):**
    From the `server/` directory, run:
    ```bash
    npm run dev
    ```
    The backend will start with hot-reloading, typically on port 3001.

### 3. Production Environment (PM2)

The project is configured for production deployment using **PM2**.

1.  **Configure Environment:** Create a `.env` file inside the `server/` directory with the necessary database credentials.
    ```
    # ./server/.env
    DB_HOST=your_database_host
    DB_PORT=3307
    DB_USER=your_database_user
    DB_PASSWORD=your_database_password
    DB_DATABASE=your_database_name
    HOST=0.0.0.0
    ```

2.  **Build Frontend:** From the root directory, create an optimized production build of the frontend.
    ```bash
    npm run build
    ```
    This will generate a `dist/` directory.

3.  **Start Services with PM2:** Use the provided ecosystem file to start both the frontend and backend services.
    ```bash
    pm2 start ecosystem.config.js
    ```
    *   The **frontend** will be served statically from the `dist/` folder on **port 3000**.
    *   The **backend** API will run on **port 3001**.

## Development Conventions

*   **Full-Stack TypeScript:** The project utilizes TypeScript in the frontend, providing type safety and better developer experience.
*   **Environment Variables:** Backend configuration (especially sensitive data like database credentials) is managed via a `.env` file, which is a good security practice.
*   **Component-Based UI:** The use of React and Chakra UI promotes a modular, component-based approach to building the user interface.
*   **REST API:** The frontend and backend communicate via a standard RESTful API, with endpoints like `/api/data` and `/api/login`.
