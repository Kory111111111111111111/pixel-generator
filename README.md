# 🎨 Pixel Art Generator

A modern, AI-powered pixel art generator built with Next.js, shadcn/ui components, and Google Gemini AI. Create stunning pixel art with simple text descriptions!

## ✨ Features

- **AI-Powered Generation**: Use Google Gemini to generate pixel art from text descriptions
- **Modern UI**: Beautiful interface built with shadcn/ui components
- **Customizable Settings**: 
  - Multiple art styles (16-bit, 8-bit, fantasy, sci-fi, etc.)
  - Various canvas sizes (16x16 to 256x256)
  - Adjustable color palette (4-32 colors)
- **Generation History**: Keep track of all your creations
- **Download Support**: Save your pixel art as PNG files
- **GitHub Pages Ready**: Optimized for static deployment

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Google Gemini API key (users enter their own in the app)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/pixel-generator.git
   cd pixel-generator
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

5. **Get your API key and start creating!**
   - Click "Show API Key Field" in the app
   - Get your free API key from [Google AI Studio](https://makersuite.google.com/)
   - Enter your API key in the app
   - Start generating pixel art!

## 🔑 Getting a Google Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/)
2. Sign in with your Google account
3. Create a new API key
4. Copy the key and paste it into the app's API key field

**No environment variables needed!** Users can enter their own API key directly in the app interface.

## 🏗️ Building for Production

```bash
npm run build
```

The app will be built and exported to the `out` directory, ready for static hosting.

## 🚀 Deployment to GitHub Pages

### Automatic Deployment

This project includes a GitHub Actions workflow that automatically deploys to GitHub Pages:

1. **Enable GitHub Pages**:
   - Go to your repository settings
   - Navigate to "Pages" section
   - Set source to "GitHub Actions"

2. **Push to main/master branch**:
   ```bash
   git push origin main
   ```

The workflow will automatically build and deploy your app to GitHub Pages.

**Note:** No environment variables or secrets needed! Users will enter their own API keys directly in the app interface.

### Manual Deployment

```bash
npm run build
npm run deploy
```

## 🎯 Usage

1. **Enter a description** of the pixel art you want to create
2. **Choose your style** (16-bit retro, 8-bit classic, fantasy RPG, etc.)
3. **Select canvas size** (16x16 to 256x256 pixels)
4. **Adjust color palette** size (4-32 colors)
5. **Click "Generate Pixel Art"**
6. **Download** your creation or save it to history

### Example Prompts

- "A cute red dragon breathing fire"
- "A magical forest with glowing mushrooms"
- "A retro spaceship flying through stars"
- "A pixel art cat wearing a wizard hat"
- "An 8-bit style castle on a hill"

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **UI Components**: shadcn/ui + Radix UI
- **Styling**: Tailwind CSS
- **AI**: Google Gemini API
- **Icons**: Lucide React
- **Notifications**: Sonner
- **Deployment**: GitHub Pages with GitHub Actions

## 📁 Project Structure

```
pixel-generator/
├── src/
│   ├── components/
│   │   ├── ui/           # shadcn/ui components
│   │   └── PixelArtGenerator.tsx
│   ├── lib/
│   │   ├── utils.ts
│   │   └── gemini.ts     # Google Gemini integration
│   ├── pages/
│   │   ├── _app.tsx
│   │   ├── _document.tsx
│   │   └── index.tsx
│   └── styles/
│       └── globals.css
├── .github/workflows/
│   └── deploy.yml        # GitHub Pages deployment
├── next.config.ts        # Next.js configuration
└── package.json
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for the beautiful component library
- [Google Gemini](https://deepmind.google/technologies/gemini/) for AI-powered generation
- [Lucide](https://lucide.dev/) for the icon set
- [Tailwind CSS](https://tailwindcss.com/) for styling

## 🐛 Issues & Support

If you encounter any issues or have questions, please [open an issue](https://github.com/yourusername/pixel-generator/issues) on GitHub.

---

Made with ❤️ and AI