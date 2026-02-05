# Portfolio - Next.js Migration

A modern portfolio built with Next.js 15, TypeScript, and Tailwind CSS. This project represents a complete migration from the original Nuxt.js portfolio.

## 🚀 Features

- **Next.js 15** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Responsive Design** - mobile-first approach
- **Dark Mode** support
- **Modern React Patterns** with hooks and functional components

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   ├── about/             # About page
│   └── globals.css        # Global styles
├── components/            # Reusable components
│   └── Navigation.tsx     # Navigation component
└── lib/                   # Utility functions
```

## 🛠️ Tech Stack

- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS
- **React Icons** - Icon library
- **Headless UI** - Accessible component primitives

## 🚀 Getting Started

1. **Install dependencies:**

   ```bash
   pnpm install
   ```

2. **Run the development server:**

   ```bash
   pnpm run dev
   ```

3. **Open your browser:**
   Visit [http://localhost:3000](http://localhost:3000)

## 📋 Migration Progress

- [x] Project setup and configuration
- [x] Basic routing and navigation
- [x] Component structure
- [ ] State management migration
- [ ] API routes migration
- [ ] Styling and theming
- [ ] Performance optimization
- [ ] Testing setup

## 🔄 Migration from Nuxt.js

This project demonstrates the migration from Nuxt.js to Next.js, including:

- **Routing**: Nuxt pages → Next.js app directory
- **Components**: Vue SFCs → React functional components
- **State Management**: Pinia → Zustand/Context
- **Styling**: CSS Modules → Tailwind CSS
- **Build**: Nuxt build → Next.js build

## 📄 License

This project is licensed under the MIT License.
