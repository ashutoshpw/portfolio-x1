# Portfolio X1

A modern, minimalist portfolio website for Ashutosh Kumar, Full Stack Developer.

## 🚀 About

This is a coming soon landing page built with cutting-edge web technologies. The site features a clean design with an email signup form to notify visitors when the full portfolio is ready.

**Key Features:**
- Modern, minimalist UI design
- Email notification signup
- Responsive layout (mobile-first)
- Server-side form handling
- TypeScript type safety

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org) (App Router)
- **Language**: TypeScript 5
- **UI**: React 19
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com)
- **Fonts**: Geist Sans & Geist Mono
- **Linting**: [Biome](https://biomejs.dev)
- **Package Manager**: npm (supports bun)

## 📦 Getting Started

### Prerequisites

- Node.js 20+ or Bun
- npm, yarn, pnpm, or bun

### Installation

```bash
# Clone the repository
git clone https://github.com/ashutoshpw/portfolio-x1.git
cd portfolio-x1

# Install dependencies
npm install
```

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the site.

The page auto-updates as you edit files in the `src/` directory.

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run Biome linter
npm run format   # Format code with Biome
```

## 📁 Project Structure

```
portfolio-x1/
├── src/
│   ├── app/
│   │   ├── actions.ts       # Server actions
│   │   ├── layout.tsx       # Root layout
│   │   ├── page.tsx         # Home page
│   │   └── globals.css      # Global styles
│   ├── components/
│   │   ├── Button.tsx       # Button component
│   │   └── EmailSignup.tsx  # Email signup form
├── public/                  # Static assets
├── .github/
│   └── copilot-instructions.md  # GitHub Copilot configuration
└── ...config files
```

## 🎨 Features

### Email Signup

The site includes a functional email signup form that:
- Validates email format
- Stores emails locally for notifications
- Provides user feedback
- Uses React 19's new useTransition hook

### Responsive Design

Built with a mobile-first approach using Tailwind CSS 4, ensuring optimal viewing experience across all devices.

## 🚢 Deployment

### Deploy on Vercel

The easiest way to deploy is using [Vercel](https://vercel.com/new):

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/ashutoshpw/portfolio-x1)

### Other Platforms

This Next.js app can be deployed to any platform that supports Node.js:
- [Netlify](https://www.netlify.com/)
- [AWS Amplify](https://aws.amazon.com/amplify/)
- [Railway](https://railway.app/)
- [Render](https://render.com/)

See the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## 👨‍💻 About the Developer

**Ashutosh Kumar**
- 10+ years of experience in Full Stack Development
- Specializes in building scalable web applications
- Passionate about clean code and modern web technologies

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/ashutoshpw/portfolio-x1/issues).

## ⭐ Show Your Support

Give a ⭐️ if you like this project!
