# Copilot Instructions for portfolio-x1

## Project Overview

This is a modern Next.js 16 portfolio website for Ashutosh Kumar, a Full Stack Developer with 10+ years of experience. The project is built with TypeScript, React 19, Tailwind CSS 4, and uses Biome for linting and formatting.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5
- **UI Library**: React 19
- **Styling**: Tailwind CSS 4
- **Linting/Formatting**: Biome
- **Package Manager**: npm (also supports bun)

## Project Structure

```
src/
├── app/
│   ├── actions.ts       # Server actions (email signup)
│   ├── layout.tsx       # Root layout with metadata
│   ├── page.tsx         # Home page
│   └── globals.css      # Global styles
├── components/
│   ├── Button.tsx       # Reusable button component
│   └── EmailSignup.tsx  # Email signup form
└── public/              # Static assets
```

## Development Guidelines

### Code Style

1. **TypeScript**: Use strict TypeScript. All files should be `.tsx` or `.ts`
2. **Imports**: 
   - Use `node:` protocol for Node.js built-in modules (e.g., `node:fs/promises`, `node:path`)
   - Organize imports alphabetically
   - Use type imports with `import type` when importing types only
3. **Formatting**: Follow Biome configuration in `biome.json`
4. **Components**: Use functional components with TypeScript interfaces for props

### File Conventions

- Server actions: Use `"use server"` directive at the top of files
- Client components: Use `"use client"` directive when using hooks or browser APIs
- Styles: Use Tailwind CSS utility classes
- Fonts: Project uses Geist and Geist Mono from Google Fonts

### Data Storage

- Email signups are stored locally in `data/signups.txt`
- The `data/` directory is created automatically by server actions
- Add `data/` to `.gitignore` to avoid committing user data

### Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run Biome linter
npm run format   # Format code with Biome
```

### Testing

Currently, there are no tests in this project. When adding tests:
- Follow Next.js testing best practices
- Use Jest or Vitest for unit tests
- Consider using React Testing Library for component tests

## Best Practices for Changes

1. **Lint First**: Always run `npm run lint` before making changes to understand existing issues
2. **Fix Linting**: Address linting issues in files you modify using `npm run format`
3. **Type Safety**: Ensure all TypeScript types are properly defined
4. **Server Actions**: Keep server-side logic in `actions.ts` with `"use server"` directive
5. **Responsive Design**: All UI should be mobile-first and responsive
6. **Accessibility**: Follow WCAG guidelines for accessibility

## Common Tasks

### Adding a New Component
1. Create component in `src/components/`
2. Use TypeScript interface for props
3. Export as named export
4. Apply Tailwind classes for styling

### Adding a New Page
1. Create route in `src/app/`
2. Use Server Components by default
3. Add metadata export for SEO
4. Use client components only when needed

### Modifying Server Actions
1. Keep actions in `src/app/actions.ts`
2. Use `"use server"` directive
3. Validate all inputs
4. Return structured responses with `success` or `error` keys

## Security Considerations

1. **Input Validation**: Always validate user input in server actions
2. **Email Validation**: Use regex patterns for email validation
3. **File System**: Be cautious with file system operations
4. **Environment Variables**: Store sensitive data in `.env` files (not committed)

## Known Issues

- Build may fail in restricted network environments due to Google Fonts fetching
- This is expected in sandboxed environments; fonts will work in normal deployments

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Biome Documentation](https://biomejs.dev/)
- [React Documentation](https://react.dev/)
