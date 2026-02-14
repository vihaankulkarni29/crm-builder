# RFRNCS OS CRM

A modern CRM and Operations dashboard built for **RFRNCS OS** (Creative Agency).
Scaffolded with **Next.js 14**, **TypeScript**, **Tailwind CSS**, and **Shadcn/UI**.

## 🚀 Features

- **Dashboard**: High-level overview of revenue, active leads, and team efficiency.
- **Leads (CRM)**: Kanban board for managing lead stages (Cold -> Closed).
- **Operations**: Project management table with status tracking and "My Projects" filter.
- **Finance**: Financial overview with revenue stats and transaction history.
- **Dark Mode**: Sleek, professional dark-themed UI (Slate/Zinc).

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [Shadcn/UI](https://ui.shadcn.com/)
- **Icons**: [Lucide React](https://lucide.dev/)

## 📂 Project Structure

```bash
src/
├── app/              # Next.js App Router pages
│   ├── leads/        # Leads Kanban board
│   ├── operations/   # Project management table
│   └── finance/      # Finance dashboard
├── components/       # Reusable UI components
│   ├── ui/           # Shadcn/UI primitives
│   ├── leads/        # Lead-specific components
│   └── operations/   # Operation-specific components
├── lib/              # Utilities and mock data
└── types/            # TypeScript interfaces
```

## ⚡ Getting Started

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Run the development server:**
    ```bash
    npm run dev
    ```

3.  **Open the app:**
    Visit [http://localhost:3000](http://localhost:3000).

## 🔧 Building for Production

To create an optimized production build:

```bash
npm run build
```

## 📜 License

Private property of RFRNCS OS.
