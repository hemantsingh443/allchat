# AllChat - T3Chat Clone

A modern, feature-rich AI chat application built as a T3Chat clone for the Cloneathon competition. This project demonstrates the implementation of a full-stack chat application with advanced AI capabilities, web search integration, and a beautiful glass-morphism UI, inspired by the original T3Chat design.

## 🚀 Features

### 🤖 Multiple AI Model Support
- **Google Gemini 1.5 Flash & Pro** - Fast and powerful AI models
- **Mistral AI 7B Instruct** - Free, high-quality open-source model
- **OpenAI GPT-4o, GPT-4 Turbo, GPT-3.5 Turbo** - Industry-leading models
- **Anthropic Claude 3 Opus & Sonnet** - Advanced reasoning capabilities
- **DeepSeek Models** - Special models with enhanced reasoning and higher token limits
- **Easy model switching** with visual capabilities indicators
- **Model branching** for parallel conversations
- **Smart token management** with dynamic limits based on model type

### 🔍 Advanced Web Search Integration
- **Real-time web search** using Tavily API
- **Context-aware responses** with search results
- **Search results preserved** during message regeneration
- **YouTube video embedding** in search results
- **Collapsible search results panel**
- **Animated searching indicator**
- **Search result highlighting** and interaction

### 💬 Rich Chat Features
- **Message editing and deletion** with confirmation dialogs
- **Message regeneration** with different models
- **Chat branching** for parallel conversations
- **Image upload and preview** with drag-and-drop support
- **Code syntax highlighting** with language detection
- **Markdown support** with enhanced rendering
- **LaTeX mathematical expressions** support with KaTeX
- **Guest mode** with trial limit and migration to authenticated accounts
- **Message copying** with one-click functionality
- **Message reactions** and interaction indicators

### 🎨 Modern UI/UX
- **Glass-morphism design** with backdrop blur effects
- **Dark/Light mode** with smooth transitions
- **Responsive layout** for all device sizes
- **Smooth animations** with Framer Motion
- **Welcome screen** with suggestion cards
- **Scroll-to-bottom button** with smooth scrolling
- **Loading and searching indicators** with progress states
- **Message capability icons** for visual feedback
- **Enhanced settings modal** with glassy design
- **Token limits visualization** with detailed explanations
- **Model selection interface** with capability indicators

### 🔐 Authentication & Security
- **Secure user authentication** with Clerk
- **Protected routes and API endpoints**
- **API key management** for different services
- **Guest mode** with limited functionality
- **Secure key storage** in browser local storage
- **Key verification** with real-time validation

### ⚙️ Advanced Settings & Configuration
- **Comprehensive Settings Modal** with glass-morphism design
- **API Key Management**
  - OpenRouter API key for paid models
  - Tavily API key for web search
  - Real-time key verification
  - Secure key storage and deletion
- **Token Limits Management**
  - Dynamic token limit calculation
  - User type-based limits (Guest, Free, Pro)
  - Model-specific adjustments
  - Feature-based reductions (web search, streaming)
  - Special DeepSeek model handling
- **Maximize Token Capacity Toggle**
  - Unlock maximum token limits with API keys
  - DeepSeek models get 25k tokens max
  - Other models get 15k tokens max
  - Visual feedback and requirements display
- **Token Limits Education**
  - "How Token Limits Work" section
  - Step-by-step calculation explanation
  - Real-world examples and use cases
  - Special cases and pro tips
  - Current limits display for all user types

### 🧮 LaTeX & Mathematical Support
- **KaTeX integration** for mathematical expressions
- **Inline math support** with `$...$` syntax
- **Block math support** with `$$...$$` syntax
- **Mathematical expression rendering** in chat messages
- **LaTeX test interface** for expression validation
- **Error handling** for invalid LaTeX syntax

### 🛠️ Developer Features
- **Custom API key management** with validation
- **Model selection interface** with capabilities
- **Real-time chat status indicators**
- **Database migrations** with Drizzle ORM
- **Environment variable configuration**
- **Vercel deployment support**
- **Token configuration API** for dynamic limits
- **Enhanced error handling** and user feedback

## 🛠️ Tech Stack

### Frontend
- **React** - UI framework
- **Tailwind CSS** - Styling and design system
- **Framer Motion** - Animations and transitions
- **Headless UI** - Accessible UI components
- **Clerk Authentication** - User authentication
- **React Markdown** - Markdown rendering
- **React Syntax Highlighter** - Code highlighting
- **KaTeX** - Mathematical expression rendering
- **Lucide React** - Icon library

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **Drizzle ORM** - Database ORM
- **PostgreSQL** - Database (Neon Serverless)

### AI/APIs
- **Google Gemini** - AI model provider
- **OpenRouter** - Multi-model AI API
- **Tavily Search** - Web search API
- **Clerk Auth** - Authentication service

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- PostgreSQL (v14 or higher) or Neon Serverless Database
- API keys for:
  - Google Gemini
  - OpenRouter (optional, for paid models)
  - Tavily (optional, for web search)
  - Clerk

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

# Start frontend (from frontend directory)
npm start
```

## 📝 Usage

### Basic Usage
1. **Sign in** using Clerk authentication or try guest mode
2. **Add API keys** in the settings for enhanced features
3. **Start chatting** with the AI
4. **Switch models** using the model selector
5. **Enable web search** for real-time information
6. **Upload images** for visual context
7. **Use LaTeX** for mathematical expressions

### Advanced Features
1. **Token Management**
   - View current token limits in settings
   - Enable "Maximize Token Capacity" with API keys
   - Understand how token limits are calculated
   - Monitor token usage during conversations

2. **Model Selection**
   - Choose from multiple AI models
   - See model capabilities and limitations
   - Use model branching for parallel conversations
   - Compare responses across different models

3. **Web Search**
   - Enable real-time web search
   - View and interact with search results
   - Use search context in AI responses
   - Collapse/expand search result panels

4. **Message Management**
   - Edit and delete messages
   - Regenerate responses with different models
   - Copy messages to clipboard
   - Branch conversations for experimentation

5. **Mathematical Expressions**
   - Use `$...$` for inline math
   - Use `$$...$$` for block math
   - Test LaTeX expressions in the test interface
   - View rendered mathematical expressions

## 🔧 Configuration

### Token Limits
The application uses dynamic token limits based on:
- **User Type**: Guest, Free, or Pro accounts
- **Model Type**: Premium models get 75% of base limits
- **Features**: Web search reduces by 20%, streaming by 10%
- **Message Length**: Longer inputs get shorter response limits
- **Special Models**: DeepSeek models get higher limits (6k-25k tokens)

### API Keys
- **OpenRouter**: Required for paid models and maximize tokens feature
- **Tavily**: Required for web search functionality
- **Google Gemini**: Used for free model access
- **Clerk**: Handles user authentication

## 🤝 Contributing

This project was created for the Cloneathon competition. While it's primarily a demonstration project, contributions are welcome! Please feel free to submit issues and pull requests.

### Development Guidelines
- Follow the existing code style and patterns
- Add tests for new features
- Update documentation for any changes
- Ensure accessibility standards are met

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built as a T3Chat clone for the Cloneathon competition
- Inspired by the original T3Chat design and modern AI chat interfaces
- Thanks to all the open-source libraries and tools that made this project possible
- Special thanks to the AI model providers (Google, OpenRouter, Tavily) for their amazing APIs
- Original T3Chat project for the inspiration and design patterns
- KaTeX team for mathematical expression rendering
- Clerk team for authentication services

## 📞 Contact

For any questions or feedback, please open an issue in the repository.

---

Made with ❤️ as a T3Chat clone for the Cloneathon competition 
