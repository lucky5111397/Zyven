# Zyven

Zyven is an AI-powered UI component generator that allows developers to instantly create, preview, and save production-ready React components. By leveraging advanced language models through OpenRouter, Zyven translates natural language descriptions into clean, functional React code that you can preview live and integrate directly into your projects.

## Overview

Building UI components from scratch can be time-consuming. Zyven solves this by providing a unified platform where you can prompt an AI to design a component, instantly preview its live rendering, tweak the code if necessary, and permanently save it to your personal library for future use. 

## Features

- **AI Component Generation**: Generate React components from text prompts using Nvidia Nemotron (via OpenRouter).
- **Live Interactive Preview**: Safely compile and preview generated components live in the browser using `react-live`.
- **Component Saving & Management**: Manually save components you like to your personal database.
- **My Components Library**: A dedicated, isolated dashboard to view and retrieve your saved components.
- **AI Credit System**: A built-in credit economy where generation costs credits.
- **Secure Payments**: Razorpay integration to seamlessly purchase additional AI credits.
- **Google Authentication**: Secure and fast login using Firebase Google Auth and JWT HTTP-only cookies.
- **Syntax Highlighting & Formatting**: Clean code views for easy copying and pasting into your own codebase.

## Tech Stack

### Frontend
- **React 19** & **Vite**
- **React Router DOM v7**
- **TailwindCSS v4**
- **Redux Toolkit** (State management)
- **Framer Motion** (Animations)
- **React Live** (In-browser code execution & preview)
- **Axios** (API client)

### Backend
- **Node.js** & **Express.js**
- **MongoDB** & **Mongoose** (Database & ODM)
- **JSON Web Tokens (JWT)** (Authentication)
- **Cookie Parser** (Session management)

### AI & External Services
- **OpenRouter API** (AI generation engine)
- **Firebase** (Google OAuth provider)
- **Razorpay** (Payment gateway)

## Project Structure

```text
zyven/
├── client/                 # Frontend React application
│   ├── public/             # Static assets (including Zyven logo)
│   ├── src/
│   │   ├── components/     # Reusable UI components (LiveComponentPreview, Auth)
│   │   ├── pages/          # Application routes (Home, Generate, MyComponents, Pricing, etc.)
│   │   ├── store/          # Redux store and slices
│   │   └── App.jsx         # Main application routing and entry point
│   └── package.json
│
└── server/                 # Backend Node.js/Express application
    ├── controllers/        # Request handlers (AI, Auth, Components, Payments, Users)
    ├── middlewares/        # Security and authentication (isAuth)
    ├── models/             # MongoDB schemas (User, Component, Payment)
    ├── routes/             # API route definitions
    ├── utils/              # Helper functions (OpenRouter integration, Razorpay setup)
    ├── index.js            # Express server entry point
    └── package.json
```

## Application Flow

1. **Authentication**: Users sign in via Google (Firebase). The backend verifies the user and issues an HTTP-only JWT cookie.
2. **Component Generation**: Users enter a prompt in the "Generate" page. The backend calls the OpenRouter API, deducts an AI credit, and returns the raw React code.
3. **Live Preview**: The frontend sanitizes the response and renders the React code in real-time.
4. **Save Action**: *Generation is temporary*. To keep a component, the user clicks "Save", which permanently stores the component in MongoDB under their user ID.
5. **My Components**: Users can browse their previously saved components in an isolated, secure dashboard.

## AI Component Generation

When a prompt is submitted, the backend constructs a strict system prompt instructing the AI to return only valid JSX/React code. This is routed through **OpenRouter** (specifically utilizing the `nvidia/nemotron-3-super-120b-a12b:free` model). 

The raw text response is sent back to the frontend where `react-live` securely parses, compiles, and renders the component in a sandboxed preview window.

## Component Saving & My Components

To ensure database integrity and prevent clutter:
- **Generating a component does NOT automatically save it to the database.** It exists only in the frontend state.
- A component is only saved when the user explicitly clicks the **Save** button.
- Saved components are strictly linked to the authenticated user's `ObjectId`.
- The **My Components** page fetches exclusively from a secure endpoint that filters components by the logged-in user, guaranteeing complete data isolation.

## Payments & AI Credits

Users are allotted a starting balance of AI Credits. Each component generation costs 1 credit.
Users can purchase additional credits (e.g., the Pro plan for ₹99) via the **Pricing** page.

**Payment Flow**:
1. Frontend requests an order creation.
2. Backend creates a Razorpay order securely.
3. Frontend launches the Razorpay checkout modal.
4. Upon success, Razorpay returns a signature which the backend verifies using the `crypto` module.
5. The user's `aiCredits` balance is updated in MongoDB.

## API Routes

| Method | Endpoint | Purpose | Auth Required |
|--------|----------|---------|---------------|
| `POST` | `/api/auth/google` | Authenticate with Google & issue JWT | No |
| `GET`  | `/api/auth/logout` | Clear JWT cookie | No |
| `POST` | `/api/component/generate` | Generate React code via AI | Yes |
| `POST` | `/api/component/save` | Permanently save a component | Yes |
| `GET`  | `/api/component/my-components`| Fetch the logged-in user's components| Yes |
| `GET`  | `/api/component/all-components`| Fetch public components | No |
| `POST` | `/api/payment/create` | Create a Razorpay order | Yes |
| `POST` | `/api/payment/verify` | Verify Razorpay signature & add credits| Yes |
| `GET`  | `/api/user/current-user` | Fetch logged-in user profile | Yes |

## Environment Variables

### Backend (`server/.env`)
```env
PORT=8000
MONGODB_URL=your_mongodb_connection_string
JWT_SECRET=your_secure_jwt_secret
OPENROUTER_API_KEY=your_openrouter_api_key
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

### Frontend (`client/.env`)
```env
VITE_SERVER_URL=http://localhost:8000
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
```

## Installation & Development

You will need two separate terminal windows to run the frontend and backend simultaneously.

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd zyven
```

### 2. Backend Setup
```bash
cd server
npm install
# Create a .env file based on the variables listed above
npm run dev
```
*The backend will start on `http://localhost:8000` using nodemon.*

### 3. Frontend Setup
```bash
cd client
npm install
# Create a .env file based on the variables listed above
npm run dev
```
*The frontend will start on `http://localhost:5173` using Vite.*

## Build (Production)

To create a production-ready build of the frontend:
```bash
cd client
npm run build
```
This generates optimized static files in the `client/dist` directory.

## Security Notes

- **HTTP-Only Cookies**: JWT tokens are stored in secure, HTTP-only cookies, protecting against XSS attacks.
- **Route Protection**: The backend utilizes an `isAuth` middleware to protect sensitive routes.
- **Data Isolation**: Component retrieval strictly filters by `req.userId` attached by the auth middleware, ensuring users cannot access others' private components.
- **Payment Verification**: Razorpay webhooks/callbacks are cryptographically verified using HMAC SHA256 before updating database balances.

## Troubleshooting

- **CORS Errors**: Ensure `VITE_SERVER_URL` in the frontend exactly matches the backend port, and the backend CORS configuration allows the frontend origin.
- **Missing Code in Preview**: If an old component renders "Saved component code is unavailable", it means the component was saved before the strict saving flow was implemented. Generate and save a new component.
- **Environment Variables**: Remember to restart your Vite development server whenever you modify the `client/.env` file.
- **Database Connection**: Ensure your MongoDB IP Access List allows your current IP address if using MongoDB Atlas.

## Future Improvements

- Add support for generating complex multi-file components.
- Implement a community tab where users can upvote public components.
- Add support for generating Vue or Svelte components.
- Introduce component version history.

## Contributing

1. Fork the project.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---
*Licensing information has not yet been specified.*

