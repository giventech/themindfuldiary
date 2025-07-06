# The Mindful Diary

A modern, responsive web application built with Next.js, TypeScript, and Tailwind CSS, featuring a beautiful UI powered by Radix UI components.

## 🚀 Features

**Situation Analysis**  
Log and reflect on daily experiences with emotional tracking and context.

**Dream Journal**  
Record dreams with voice notes, emotions, and vividness ratings.

**Dashboard**  
Track your journey with stats, streaks, and AI insights.

## 🛠️ Prerequisites

- Node.js 18.0.0 or later
- npm or yarn package manager
- Supabase account (for authentication and database)

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd themindfuldiary
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory and add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```
   Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🚀 Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm start` - Start the production server
- `npm run lint` - Run ESLint

## 📁 Project Structure

- `/app` - Application pages and layouts
- `/components` - Reusable UI components
- `/lib` - Utility functions and configurations
- `/public` - Static files
- `/styles` - Global styles and Tailwind configuration

## 🛠️ Tech Stack

- **Frontend**: [Next.js 14](https://nextjs.org/) with [TypeScript](https://www.typescriptlang.org/) and [React 18](https://reactjs.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [Radix UI](https://www.radix-ui.com/) components  
- **Backend**: [Supabase](https://supabase.com/) (Auth + PostgreSQL)  
- **Forms**: [React Hook Form](https://react-hook-form.com/) with [Zod](https://zod.dev/) validation  
- **Charts**: [Recharts](https://recharts.org/) for data visualization  
- **Icons**: [Lucide React](https://lucide.dev/)  
- **State**: React Context + Hooks  
- **Deployment**: Vercel-ready

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
