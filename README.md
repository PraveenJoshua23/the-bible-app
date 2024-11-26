# Modern Bible Reader

A modern, feature-rich Bible reading web application built with Next.js and TypeScript. Experience scripture reading with a clean, customizable interface and powerful search capabilities.


## ✨ Features

- **Multiple Bible Versions**
  - Support for various English translations
  - Quick version switching
  - Favorite versions for easy access

- **Smart Reference Search**
  - Intelligent parsing of Bible references
  - Support for chapter and verse ranges
  - Interactive book/chapter/verse selector

- **Customizable Reading Experience**
  - Multiple theme options (Light, Dark, Cream)
  - Adjustable font sizes and styles
  - Paragraph or verse-by-verse display
  - Optional verse numbers

- **Modern UI/UX**
  - Clean, distraction-free interface
  - Responsive design for all devices
  - Loading states and error handling
  - Keyboard navigation support

## 🚀 Getting Started

### Prerequisites

- Node.js 16.x or later
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/bible-reader.git
cd bible-reader
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```
Fill in your Bible API credentials in `.env.local`

4. Start the development server:
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🛠️ Built With

- [Next.js](https://nextjs.org/) - React framework
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Lucide Icons](https://lucide.dev/) - Icons
- [Bible API](https://scripture.api.bible/) - Scripture data

## 📖 Usage

### Quick Search
Enter Bible references in various formats:
- `jn 3:16` - Single verse
- `gen 1:1-10` - Verse range
- `ps 23` - Entire chapter

### Book Lookup
Use the book icon next to the search bar for structured navigation:
1. Select a book
2. Choose a chapter
3. Optionally select a specific verse

### Customization
Click the settings icon to customize:
- Text size
- Font style
- Theme
- Verse display format
- Verse numbers

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Bible data provided by [API.Bible](https://scripture.api.bible/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide](https://lucide.dev/)

## 📱 Screenshots

### Light Theme
![Light Theme](./public/light-theme.png)

### Dark Theme
![Dark Theme](./public/dark-theme.png)

### Settings Modal
![Settings](./public/settings.png)

---

Made with ❤️ for Bible readers everywhere