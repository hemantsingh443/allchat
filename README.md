# AllChat - T3Chat Clone

A modern, feature-rich AI chat application inspired by T3Chat, built for the Cloneathon competition. AllChat lets you chat with multiple AI models, search the web, and enjoy a beautiful, modern interface.

## 🚀 Features

### 🤖 Multiple AI Models
- Chat with Google Gemini, OpenAI GPT-4o, Mistral, Claude, DeepSeek, and more
- Easily switch between models and compare their responses
- Model capabilities like vision, reasoning, and code support

### 🔍 Web Search & Media
- Get real-time answers with integrated web search
- Upload images or PDFs for AI analysis
- Preview and manage file attachments

### 💬 Chat Experience
- Edit, delete, and regenerate messages
- Branch conversations to try different models or directions
- Markdown, code, and LaTeX support for rich formatting
- Copy messages with one click

### 🎨 Modern UI
- Glassmorphism design with dark/light mode
- Responsive and mobile-friendly
- Smooth animations and interactive elements

### 🔐 Secure & Flexible
- Sign in with Google or use guest mode (limited trials)
- Manage your API keys for different services
- Migrate guest chats to your account anytime

## 🛠️ Tech Stack
- **Frontend:** React, Tailwind CSS, Framer Motion, Clerk Auth
- **Backend:** Node.js, Express, Drizzle ORM, PostgreSQL
- **AI & APIs:** Google Gemini, OpenRouter, Tavily Search

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/hemantsingh443/allchat.git
   cd allchat
   ```
2. **Install dependencies**
   ```bash
   npm install
   cd backend && npm install
   ```
3. **Set up environment variables** (see `.env.example`)
4. **Run database migrations**
   ```bash
   cd backend
   npm run db:push
   ```
5. **Start the servers**
   ```bash
   # Backend
   npm run dev
   # Frontend (in main directory)
   npm start
   ```

## 📝 Usage
- Sign in or try guest mode
- Add API keys in settings for more features
- Start chatting, switch models, and use web search
- Upload images or PDFs for analysis
- Use LaTeX for math expressions

## 🤝 Contributing
Contributions are welcome! Please open an issue or pull request.

## 📄 License
MIT License. See [LICENSE](LICENSE) for details.

---

Made with ❤️ for the Cloneathon competition.
