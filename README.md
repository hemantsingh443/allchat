# AllChat - T3Chat Clone

A modern, feature-rich AI chat application built as a T3Chat clone for the Cloneathon competition. This project demonstrates the implementation of a full-stack chat application with advanced AI capabilities, web search integration, and a beautiful glass-morphism UI, inspired by the original T3Chat design.

## 🚀 Features

- 🤖 Multiple AI Model Support
  - Google Gemini 1.5 Flash & Pro
  - Mistral AI 7B Instruct (Free)
  - OpenAI GPT-4o, GPT-4 Turbo, GPT-3.5 Turbo
  - Anthropic Claude 3 Opus & Sonnet
  - Easy model switching with visual capabilities indicators
  - Model branching for parallel conversations
- 🔍 Advanced Web Search Integration
  - Real-time web search using Tavily API
  - Context-aware responses with search results
  - Search results preserved during message regeneration
  - YouTube video embedding in search results
  - Collapsible search results panel
  - Animated searching indicator
- 💬 Rich Chat Features
  - Message editing and deletion
  - Message regeneration with different models
  - Chat branching for parallel conversations
  - Image upload and preview
  - Code syntax highlighting
  - Markdown support
  - Guest mode with trial limit
  - Guest chat migration to authenticated account
- 🎨 Modern UI/UX
  - Glass-morphism design
  - Dark/Light mode
  - Responsive layout
  - Smooth animations with Framer Motion
  - Welcome screen with suggestion cards
  - Scroll-to-bottom button
  - Loading and searching indicators
  - Message capability icons
  - Copy message functionality
- 🔐 Authentication & Security
  - Secure user authentication with Clerk
  - Protected routes and API endpoints
  - API key management for different services
  - Guest mode with limited functionality
- 🛠️ Developer Features
  - Custom API key management
  - Model selection interface
  - Real-time chat status indicators
  - Database migrations with Drizzle ORM
  - Environment variable configuration
  - Vercel deployment support

## 🛠️ Tech Stack

- **Frontend**
  - React
  - Tailwind CSS
  - Framer Motion
  - Headless UI
  - Clerk Authentication
  - React Markdown
  - React Syntax Highlighter
- **Backend**
  - Node.js
  - Express
  - Drizzle ORM
  - PostgreSQL (Neon Serverless)
- **AI/APIs**
  - Google Gemini
  - OpenRouter
  - Tavily Search
  - Clerk Auth

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- PostgreSQL (v14 or higher) or Neon Serverless Database
- API keys for:
  - Google Gemini
  - OpenRouter (optional)
  - Tavily (optional)
  - Clerk

### Installation

1. Clone the repository
```bash
git clone https://github.com/hemantsingh443/allchat.git
cd allchat
```

2. Install dependencies
```bash
# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

3. Set up environment variables

Frontend (.env):
```env
REACT_APP_CLERK_PUBLISHABLE_KEY=your_clerk_key
REACT_APP_API_URL=http://localhost:5001
```

Backend (.env):
```env
PORT=5001
CLERK_SECRET_KEY=your_clerk_secret
GOOGLE_API_KEY=your_google_key
TAVILY_API_KEY=your_tavily_key
OPENROUTER_API_KEY=your_openrouter_key
DATABASE_URL=postgresql://username:password@localhost:5432/allchat
```

4. Run database migrations
```bash
cd backend
npm run db:push
```

5. Start the development servers

```bash
# Start backend (from backend directory)
npm run dev

# Start frontend (from frontend directory)
npm start
```

## 📝 Usage

1. Sign in using Clerk authentication or try guest mode
2. (Optional) Add your API keys in the settings
3. Start chatting with the AI
4. Use the model selector to switch between different AI models
5. Enable web search for real-time information
6. Upload images for visual context
7. Edit, delete, or regenerate messages as needed
8. Branch conversations to try different models
9. View and interact with search results
10. Migrate guest chats to your authenticated account

## 🤝 Contributing

This project was created for the Cloneathon competition. While it's primarily a demonstration project, contributions are welcome! Please feel free to submit issues and pull requests.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built as a T3Chat clone for the Cloneathon competition
- Inspired by the original T3Chat design and modern AI chat interfaces
- Thanks to all the open-source libraries and tools that made this project possible
- Special thanks to the AI model providers (Google, OpenRouter, Tavily) for their amazing APIs
- Original T3Chat project for the inspiration and design patterns

## 📞 Contact

For any questions or feedback, please open an issue in the repository.

---

Made with ❤️ as a T3Chat clone for the Cloneathon competition
