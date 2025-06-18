# AllChat - T3Chat Clone

A modern, feature-rich AI chat application built as a T3Chat clone for the Cloneathon competition. This project demonstrates the implementation of a full-stack chat application with advanced AI capabilities, web search integration, and a beautiful glass-morphism UI, inspired by the original T3Chat design.

## 🚀 Features

### 🤖 Multiple AI Model Support
- **Google Gemini 1.5 Flash & Pro** - Fast and powerful AI models with vision capabilities
- **Mistral AI 7B Instruct & Devstral Small** - Free, high-quality open-source models
- **OpenAI GPT-4o, GPT-4 Turbo, GPT-3.5 Turbo** - Industry-leading models
- **Anthropic Claude 3 Opus & Sonnet** - Advanced reasoning capabilities
- **DeepSeek R1** - Special models with enhanced reasoning and higher token limits (12k tokens)
- **Kimi-Dev-72B** - Advanced reasoning and coding capabilities
- **Easy model switching** with visual capabilities indicators (Vision, Reasoning, Code)
- **Model branching** for parallel conversations
- **Smart token management** with dynamic limits based on model type
- **Real-time model capability display** with tooltips
- **Guest mode restrictions** with automatic fallback to free models

### 🔍 Advanced Web Search Integration
- **Real-time web search** using Tavily API with advanced search depth
- **Context-aware responses** with search results integration
- **Search results preserved** during message regeneration
- **YouTube video embedding** in search results with custom icons
- **Twitter/X platform support** with custom favicon handling
- **Collapsible search results panel** with compact card design
- **Animated searching indicator** with progress states
- **Search result highlighting** and interaction
- **Vision-based web search** for image queries
- **Smart query construction** with length management
- **Search query suggestions** and optimization

### 💬 Rich Chat Features
- **Message editing and deletion** with confirmation dialogs
- **Message regeneration** with different models and preserved context
- **Chat branching** for parallel conversations and experimentation
- **Image upload and preview** with drag-and-drop support
- **PDF file processing** with text extraction and analysis
- **Code syntax highlighting** with language detection and copy functionality
- **Markdown support** with enhanced rendering
- **LaTeX mathematical expressions** support with KaTeX integration
- **Guest mode** with trial limit (8 trials) and migration to authenticated accounts
- **Message copying** with one-click functionality and visual feedback
- **Message reactions** and interaction indicators
- **Streaming responses** with real-time content updates
- **Optimistic UI updates** for better user experience
- **Chat history persistence** with automatic saving

### 🎨 Modern UI/UX
- **Glass-morphism design** with backdrop blur effects and interactive aurora background
- **Dark/Light mode** with smooth transitions and theme persistence
- **Responsive layout** for all device sizes with mobile optimization
- **Smooth animations** with Framer Motion and spring physics
- **Welcome screen** with suggestion cards and interactive elements
- **Scroll-to-bottom button** with smooth scrolling and smart visibility
- **Loading and searching indicators** with progress states and custom icons
- **Message capability icons** for visual feedback (Vision, Reasoning, Code)
- **Enhanced settings modal** with glassy design and tabbed interface
- **Token limits visualization** with detailed explanations and real-time updates
- **Model selection interface** with capability indicators and search functionality
- **Interactive tooltips** with hover effects and contextual information
- **Custom scrollbars** with smooth scrolling experience
- **Image viewer modal** with full-screen preview capabilities

### 🔐 Authentication & Security
- **Secure user authentication** with Clerk and Google OAuth
- **Protected routes and API endpoints** with JWT token validation
- **API key management** for different services with secure storage
- **Guest mode** with limited functionality and trial system
- **Secure key storage** in browser local storage with encryption
- **Key verification** with real-time validation and status indicators
- **Migration system** for guest users to authenticated accounts
- **Session management** with automatic token refresh

### ⚙️ Advanced Settings & Configuration
- **Comprehensive Settings Modal** with glass-morphism design and tabbed interface
- **API Key Management**
  - OpenRouter API key for paid models with verification
  - Tavily API key for web search with real-time validation
  - Secure key storage and deletion with confirmation
  - Key status indicators (success, error, idle states)
- **Token Limits Management**
  - Dynamic token limit calculation with real-time updates
  - User type-based limits (Guest: 2k, Free: 4k, Pro: 8k tokens)
  - Model-specific adjustments (premium models get 75% of base)
  - Feature-based reductions (web search: -20%, streaming: -10%)
  - Special DeepSeek model handling (6k-25k tokens)
  - Message length-based adjustments
- **Maximize Token Capacity Toggle**
  - Unlock maximum token limits with API keys
  - DeepSeek models get 25k tokens max
  - Other models get 15k tokens max
  - Visual feedback and requirements display
- **Token Limits Education**
  - "How Token Limits Work" section with step-by-step explanation
  - Real-world examples and use cases
  - Special cases and pro tips
  - Current limits display for all user types
  - Interactive calculation examples

### 🧮 LaTeX & Mathematical Support
- **KaTeX integration** for mathematical expressions with full syntax support
- **Inline math support** with `$...$` syntax
- **Block math support** with `$$...$$` syntax
- **Mathematical expression rendering** in chat messages with error handling
- **LaTeX test interface** for expression validation and testing
- **Error handling** for invalid LaTeX syntax with fallback rendering
- **Dark/Light mode support** for mathematical expressions
- **Responsive math rendering** with overflow handling
- **Complex mathematical expressions** including matrices, integrals, sums
- **Greek letters and mathematical symbols** support

### 📁 File Processing & Media Support
- **Image upload and processing** with drag-and-drop interface
- **PDF text extraction** with automatic content analysis
- **File preview system** with thumbnail generation
- **Image hosting integration** with IMGBB API
- **File type validation** with supported format indicators
- **Large file handling** with size limits and optimization
- **Image analysis** with AI vision capabilities
- **File attachment management** with remove functionality
- **Full-screen image viewer** with modal interface

### 🔄 Advanced Chat Management
- **Chat organization** with time-based categorization (Today, Yesterday, Previous 7 Days, etc.)
- **Chat title editing** with inline editing interface
- **Chat deletion** with confirmation dialogs
- **Chat history migration** from guest to authenticated accounts
- **Real-time chat updates** with optimistic UI
- **Chat model switching** with backend persistence
- **Chat branching** for parallel conversations
- **Chat search and filtering** capabilities
- **Chat export and backup** functionality

### 🔔 Notification & Feedback System
- **Toast notifications** with different types (success, error, info, warning)
- **Confirmation modals** with customizable options
- **Real-time status updates** for API operations
- **Error handling** with user-friendly messages
- **Loading states** with progress indicators
- **Success feedback** with visual confirmation
- **Warning messages** for user guidance
- **Info notifications** for system updates

### 🎯 Guest Mode & Migration
- **Guest trial system** with 8 message limit
- **Guest chat history** with local storage persistence
- **Migration modal** with save history options
- **Automatic model fallback** for guest users
- **Feature restrictions** with helpful tooltips
- **Seamless sign-in flow** with Google OAuth
- **Data migration** with server-side processing
- **Trial reset** after successful migration

### 🛠️ Developer Features
- **Custom API key management** with validation and error handling
- **Model selection interface** with capabilities and search
- **Real-time chat status indicators** with streaming support
- **Database migrations** with Drizzle ORM and PostgreSQL
- **Environment variable configuration** with secure defaults
- **Vercel deployment support** with serverless functions
- **Token configuration API** for dynamic limits
- **Enhanced error handling** and user feedback
- **Code splitting** and lazy loading for performance
- **TypeScript-like development** with PropTypes validation
- **Component reusability** with modular architecture
- **Performance optimization** with React.memo and useCallback

## 🛠️ Tech Stack

### Frontend
- **React 19** - Latest UI framework with concurrent features
- **Tailwind CSS** - Utility-first styling and design system
- **Framer Motion** - Advanced animations and transitions
- **Headless UI** - Accessible UI components and modals
- **Clerk Authentication** - Modern user authentication
- **React Markdown** - Markdown rendering with custom components
- **React Syntax Highlighter** - Code highlighting with themes
- **KaTeX** - Mathematical expression rendering
- **Lucide React** - Modern icon library
- **React Router** - Client-side routing

### Backend
- **Node.js** - Runtime environment with ES modules
- **Express 5** - Latest web framework
- **Drizzle ORM** - Type-safe database ORM
- **PostgreSQL** - Database (Neon Serverless)
- **PDF-parse** - PDF text extraction
- **Form-data** - File upload handling

### AI/APIs
- **Google Gemini** - AI model provider with vision capabilities
- **OpenRouter** - Multi-model AI API with streaming
- **Tavily Search** - Advanced web search API
- **Clerk Auth** - Authentication service
- **IMGBB** - Image hosting service

### Development Tools
- **Vite** - Fast build tool and dev server
- **ESLint** - Code linting and formatting
- **Prettier** - Code formatting
- **Git** - Version control

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- PostgreSQL (v14 or higher) or Neon Serverless Database
- API keys for:
  - Google Gemini
  - OpenRouter (optional, for paid models)
  - Tavily (optional, for web search)
  - Clerk
  - IMGBB (optional, for image hosting)

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
IMGBB_API_KEY=your_imgbb_key
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
6. **Upload images or PDFs** for visual context
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

6. **File Processing**
   - Upload images for AI analysis
   - Process PDF documents for text extraction
   - View file previews and manage attachments
   - Use full-screen image viewer

7. **Guest Mode**
   - Try the app without signing up
   - Limited to 8 messages with free models
   - Migrate to authenticated account later
   - Save chat history during migration

## 🔧 Configuration

### Token Limits
The application uses dynamic token limits based on:
- **User Type**: Guest (2k), Free (4k), or Pro (8k) accounts
- **Model Type**: Premium models get 75% of base limits
- **Features**: Web search reduces by 20%, streaming by 10%
- **Message Length**: Longer inputs get shorter response limits
- **Special Models**: DeepSeek models get higher limits (6k-25k tokens)
- **Maximize Tokens**: Unlock higher limits with API keys

### API Keys
- **OpenRouter**: Required for paid models and maximize tokens feature
- **Tavily**: Required for web search functionality
- **Google Gemini**: Used for free model access
- **Clerk**: Handles user authentication
- **IMGBB**: Optional for image hosting

### Model Capabilities
- **Vision**: Can analyze and understand images
- **Reasoning**: Enhanced logical reasoning capabilities
- **Code**: Specialized in programming and code generation

## 🤝 Contributing

This project was created for the Cloneathon competition. While it's primarily a demonstration project, contributions are welcome! Please feel free to submit issues and pull requests.

### Development Guidelines
- Follow the existing code style and patterns
- Add tests for new features
- Update documentation for any changes
- Ensure accessibility standards are met
- Use TypeScript-like development practices
- Maintain component reusability

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
- Framer Motion team for smooth animations
- Tailwind CSS team for the utility-first framework

## 📞 Contact

For any questions or feedback, please open an issue in the repository.

---

Made with ❤️ as a T3Chat clone for the Cloneathon competition 
