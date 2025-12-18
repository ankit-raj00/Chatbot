# Gemini Chat Frontend

A modern React.js chat application with Gemini AI and MCP integration.

## Features

- 🔐 Complete authentication (signup/login)
- 💬 Real-time chat with Gemini AI
- 📋 Conversation history management
- 🛠️ MCP tools integration
- 🎨 Beautiful UI with Tailwind CSS
- 📱 Fully responsive design

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

### 3. Build for Production

```bash
npm run build
```

## Project Structure

```
src/
├── components/
│   ├── auth/          # Authentication pages
│   ├── chat/          # Chat interface components
│   ├── mcp/           # MCP tools panel
│   └── shared/        # Reusable components
├── context/           # React context providers
├── services/          # API service layer
├── App.jsx            # Main app with routing
└── main.jsx           # Entry point
```

## Tech Stack

- **React 18** - UI library
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Axios** - HTTP client

## Environment

The frontend connects to the backend at `http://localhost:8000`

## Usage

1. **Signup**: Create a new account
2. **Login**: Sign in with your credentials
3. **Chat**: Start chatting with Gemini AI
4. **Conversations**: View and manage your chat history
5. **MCP Tools**: View available tools in the sidebar
