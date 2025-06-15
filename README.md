# AllChat - T3Chat Clone

A modern, feature-rich AI chat application built as a T3Chat clone for the Cloneathon competition. This project demonstrates the implementation of a full-stack chat application with advanced AI capabilities, web search integration, and a beautiful glass-morphism UI, inspired by the original T3Chat design.

## 🚀 Features

- 🤖 Multiple AI Model Support
  - Google Gemini Pro
  - Various OpenRouter models
  - Easy model switching
- 🔍 Web Search Integration
  - Real-time web search using Tavily API
  - Context-aware responses
- 🎨 Modern UI/UX
  - Glass-morphism design
  - Dark/Light mode
  - Responsive layout
  - Smooth animations
- 💬 Rich Chat Features
  - Message editing and deletion
  - Image upload and preview
  - Code syntax highlighting
  - Markdown support
- 🔐 Authentication
  - Secure user authentication with Clerk
  - Protected routes and API endpoints
- 🛠️ Developer Features
  - Custom API key management
  - Model selection interface
  - Real-time chat status indicators

## 🛠️ Tech Stack

- **Frontend**
  - React
  - Tailwind CSS
  - Framer Motion
  - Headless UI
  - Clerk Authentication
- **Backend**
  - Node.js
  - Express
  - Drizzle ORM
  - PostgreSQL
- **AI/APIs**
  - Google Gemini
  - OpenRouter
  - Tavily Search

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- PostgreSQL (v14 or higher)
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
IMGBB_API_KEY=your_imgbb_key
DATABASE_URL=postgresql://username:password@localhost:5432/allchat
```

4. Start the development servers

```bash
# Start backend (from backend directory)
npm run dev

# Start frontend (from frontend directory)
npm start
```

## 📝 Usage

1. Sign in using Clerk authentication
2. (Optional) Add your API keys in the settings
3. Start chatting with the AI
4. Use the model selector to switch between different AI models
5. Enable web search for real-time information
6. Upload images for visual context
7. Edit or delete messages as needed

## 🤝 Contributing

This project was created for the Cloneathon competition. While it's primarily a demonstration project, contributions are welcome! Please feel free to submit issues and pull requests.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2024 AllChat

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

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
