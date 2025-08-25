# JojoJubah Website with AI Assistant

A modern educational website featuring AI tutorials, economics guides, and an integrated AI chatbot assistant powered by Firebase and Google AI.

## 🚀 Features

- **Interactive AI Assistant** - Chat with Jojo AI for help with coding, AI concepts, and tutorials
- **Neumorphic Design** - Beautiful soft UI with light/dark theme support
- **Matrix Theme** - Special Matrix rain effect in JubahLabs section
- **Mobile Responsive** - Optimized for all devices
- **Educational Content** - AI tutorials, economics guides, and project showcases

## 📁 Project Structure

```
├── index.html              # Main homepage
├── economics.html          # Economics education page
├── labs.html              # JubahLabs experimental page
├── sitemap.xml            # SEO sitemap
│
├── css/
│   ├── style.css          # Main stylesheet with neumorphic theme
│   └── labs.css           # Labs-specific styles with Matrix theme
│
├── js/
│   ├── app.js             # Main site functionality
│   ├── assistant-chat.js  # AI chatbot functionality
│   └── labs.js            # Matrix effects and lab interactions
│
├── assets/
│   ├── jojo-assistant.png # AI assistant avatar
│   └── favicon.png        # Site favicon
│
├── data/
│   └── tips.json          # Assistant contextual tips
│
├── functions/             # Firebase Functions
│   ├── index.js          # Secure AI API handler
│   └── package.json      # Function dependencies
│
└── docs/                  # Documentation
    ├── SETUP.md
    ├── SECURITY-SETUP.md
    └── WEBSITE-INTEGRATION.md
```

## 🛠️ Setup & Deployment

### Prerequisites
- Firebase account (free)
- Google AI Studio API key (free)
- Node.js (for Firebase Functions)

### Local Development
1. Clone the repository
2. Open `index.html` in a web browser for basic testing
3. For full AI functionality, deploy to Firebase (see below)

### Firebase Deployment
1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login: `firebase login`
3. Deploy functions: `firebase deploy --only functions`
4. Deploy hosting: `firebase deploy --only hosting`

### Configuration
- Firebase config is embedded in HTML files
- AI API key is securely stored in Firebase Functions
- No environment variables needed for basic deployment

## 🤖 AI Assistant Features

The integrated AI assistant provides:
- **Context-aware responses** based on current page
- **Educational support** for AI, coding, and economics topics
- **Interactive "Ask AI" buttons** on economics concepts
- **Conversation persistence** using Firebase Firestore
- **Secure API handling** through Firebase Functions

### AI Integration Points
- **Homepage**: General AI and tutorial assistance
- **Economics Page**: Economics-focused explanations with pre-filled questions
- **Labs Page**: Experimental features and Matrix theme integration

## 🎨 Theme System

### Neumorphic Design
- CSS custom properties for consistent theming
- Light/dark mode toggle
- Soft shadows and gradients
- Mobile-optimized responsive design

### Matrix Theme (Labs)
- Animated Matrix rain canvas background
- Green color scheme when active
- Interactive Matrix controls
- Theme-aware AI chat styling

## 📱 Mobile Support

- Responsive navigation with hamburger menu
- Touch-optimized AI chat interface
- Mobile-friendly matrix effects
- Adaptive layouts for all screen sizes

## 🔧 Customization

### Modifying AI Responses
Edit `functions/index.js` to customize:
- AI personality and knowledge base
- Context injection for different pages
- Response filtering and formatting

### Styling Changes
- Main styles in `css/style.css`
- CSS custom properties for easy theme modification
- Labs-specific styling in `css/labs.css`

### Content Updates
- Edit HTML files directly
- Update tips in `data/tips.json`
- Modify navigation links as needed

## 🚀 Performance

- Optimized for fast loading
- Lazy-loaded components
- Efficient Firebase integration
- Minimal external dependencies

## 📄 License

© JojoJubah 2025 - Educational content and tutorials

## 🤝 Contributing

This is a personal portfolio/educational site, but feedback and suggestions are welcome!

---

Built with ❤️ by JojoJubah using Firebase, Google AI, and modern web technologies.
