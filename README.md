# Tenants Management System

A comprehensive web-based application designed to streamline the management of rental properties. This system helps landlords and property managers track tenants, manage bills, generate reports, and monitor the overall financial health of their properties with a modern, user-friendly interface.

## 🚀 Features

- **Dashboard**: Real-time overview of property status, including unpaid bills and recent activity.
- **Tenant Management**: Efficiently add, update, and manage tenant details.
- **Billing System**: Track monthly rent and utility bills, with support for partial payments and status tracking (Paid/Unpaid).
- **Reports**: Generate detailed financial reports for individual tenants or overall property performance. PDF export functionality included.
- **Notifications**: System alerts for important events (e.g., due dates, payment confirmations).
- **Responsive Design**: Built with a mobile-first approach, ensuring a seamless experience on all devices.
- **Modern UI**: Features a sleek, dark-mode capability with smooth animations and glassmorphism effects.

## 🛠️ Tech Stack

### Client (Frontend)
- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: TypeScript / JavaScript
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **UI Components**: [Lucide React](https://lucide.dev/) (Icons), Custom UI Components
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **PDF Generation**: `jspdf`, `jspdf-autotable`
- **HTTP Client**: Axios

### Server (Backend)
- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express.js](https://expressjs.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/)
- **Utilities**: `dotenv` (Environment variables), `cors` (Cross-Origin Resource Sharing), `pdf-lib`

## 📂 Project Structure

The project is organized as a monorepo setup:

```
Tenants Management System/
├── client/          # Frontend application (Next.js)
│   ├── app/         # App directory (Routes & Pages)
│   ├── components/  # Reusable UI components
│   └── ...
└── server/          # Backend application (Express + MongoDB)
    ├── routes/      # API Routes
    ├── models/      # Mongoose Models
    └── ...
```

## 🏁 Getting Started

Follow these instructions to set up the project locally.

### Prerequisites
- Node.js (v18 or higher recommended)
- MongoDB (Local instance or MongoDB Atlas)

### 1. Backend Setup (`server`)

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the `server` root and add your configuration:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/house-rental
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```
   The backend will run on `http://localhost:5000`.

### 2. Frontend Setup (`client`)

1. Open a new terminal and navigate to the client directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. (Optional) Configure environment variables if needed (e.g., API base URL if different from default).

4. Start the development server:
   ```bash
   npm run dev
   ```
   The frontend will run on `http://localhost:3000`.

## 📜 Scripts

**Server:**
- `npm start`: Runs the server (production mode).
- `npm run dev`: Runs the server with `nodemon` for hot-reloading.

**Client:**
- `npm run dev`: Starts the Next.js development server.
- `npm run build`: Builds the application for production.
- `npm start`: Starts the production server.
- `npm run lint`: Runs ESLint.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.
