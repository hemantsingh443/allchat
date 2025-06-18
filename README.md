# AllChat - T3Chat Clone

A modern, feature-rich AI chat application built as a T3Chat clone for the Cloneathon competition. Features multiple AI models, web search integration, and a beautiful glass-morphism UI with responsive design.

## 🚀 Features

### 🤖 AI Models
- **Multiple AI providers**: Google Gemini, OpenAI, Anthropic Claude, Mistral AI, DeepSeek, Kimi-Dev
- **Model capabilities**: Vision, Reasoning, Code generation
- **Smart token management** with dynamic limits
- **Model branching** for parallel conversations
- **Guest mode** with free model access

### 🔍 Advanced Features
- **Web search integration** with real-time results
- **PDF processing** with text extraction
- **Image upload and analysis** with AI vision
- **LaTeX mathematical expressions** support
- **Code syntax highlighting** with language detection
- **Message editing, deletion, and regeneration**
- **Chat branching** for parallel conversations

### 🎨 Modern UI/UX
- **Glass-morphism design** with backdrop blur effects
- **Mobile-responsive** with full-screen sidebar
- **Dark/Light mode** with smooth transitions
- **Smooth animations** using Framer Motion
- **Modern gradient styling** (pink-to-purple)

### 🔐 Authentication & Security
- **Clerk authentication** with Google OAuth
- **Guest mode** with trial limit
- **Secure API key management**
- **Migration system** from guest to authenticated accounts

## 🛠️ Tech Stack

### Frontend
- **React 19** - Latest UI framework
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Advanced animations
- **Clerk Authentication** - User authentication
- **KaTeX** - Mathematical expression rendering

### Backend
- **Node.js** - Runtime environment
- **Express 5** - Web framework
- **Drizzle ORM** - Type-safe database ORM
- **PostgreSQL** - Database (Neon Serverless)
- **PDF-parse** - PDF text extraction

### AI/APIs
- **Google Gemini** - AI model provider
- **OpenRouter** - Multi-model AI API
- **Tavily Search** - Web search API
- **Clerk Auth** - Authentication service

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL or Neon Serverless Database
- API keys for Google Gemini, OpenRouter, Tavily, Clerk

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/hemantsingh443/allchat.git
cd allchat
```

2. **Install dependencies**
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
```

3. **Set up environment variables**

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

4. **Run database migrations**
```bash
cd backend
npm run db:push
```

5. **Start the development servers**
```bash
# Start backend (from backend directory)
npm run dev

# Start frontend (from root directory)
npm start
```

## 📝 Usage

### Basic Usage
1. **Sign in** using Clerk authentication or try guest mode
2. **Add API keys** in settings for enhanced features
3. **Start chatting** with AI models
4. **Switch models** using the model selector
5. **Enable web search** for real-time information
6. **Upload images or PDFs** for analysis
7. **Use LaTeX** for mathematical expressions

### Key Features
- **Token Management**: View and manage token limits in settings
- **Model Selection**: Choose from multiple AI models with different capabilities
- **Web Search**: Enable real-time web search with result integration
- **Message Management**: Edit, delete, and regenerate messages
- **File Processing**: Upload and analyze images and PDFs
- **Guest Mode**: Try the app with limited features before signing up

## 🔧 Configuration

### Token Limits
- **Guest**: 2k tokens
- **Free**: 4k tokens  
- **Pro**: 8k tokens
- **Premium models**: 75% of base limits
- **Special features**: Web search (-20%), streaming (-10%)

### Required API Keys
- **Google Gemini**: Free model access
- **OpenRouter**: Paid models and advanced features
- **Tavily**: Web search functionality
- **Clerk**: User authentication

## 🤝 Contributing

This project was created for the Cloneathon competition. Contributions are welcome! Please feel free to submit issues and pull requests.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built as a T3Chat clone for the Cloneathon competition
- Inspired by the original T3Chat design
- Thanks to all open-source libraries and AI model providers

---

Made with ❤️ as a T3Chat clone for the Cloneathon competition 
