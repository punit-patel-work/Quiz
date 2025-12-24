# Quiz Platform

A modern, full-stack quiz platform built with Next.js 14, featuring user authentication, custom JSON quiz uploads, and comprehensive result tracking.

## 🚀 Features

- **User Authentication**: Secure registration with email verification via Gmail SMTP
- **Custom Quizzes**: Upload JSON files to create personalized quizzes
- **Multiple Question Types**: Support for multiple choice, true/false, and fill-in-the-blank questions
- **Timed Quizzes**: Configurable time limits with auto-submit functionality
- **Instant Feedback**: Detailed explanations for each question
- **Progress Tracking**: Personal dashboard showing quiz history and statistics
- **Dark Mode**: Beautiful UI with light/dark theme support
- **Docker Support**: Complete containerization for easy deployment

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router) with TypeScript
- **Authentication**: NextAuthNext.js v5 (Auth.js)
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: Tailwind CSS + Shadcn UI
- **State Management**: Zustand
- **Email**: Nodemailer with Gmail SMTP
- **Containerization**: Docker & Docker Compose

## 📋 Prerequisites

- Node.js 18+ and npm 9+
- PostgreSQL 16+ (or use Docker)
- Gmail account for email verification (app password required)

## 🏗️ Getting Started

### 1. Clone the Repository

```bash
cd Quiz
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Copy the example environment file and update with your credentials:

```bash
cp .env.example .env
```

Edit `.env` and configure:

```env
DATABASE_URL="postgresql://quizuser:quizpassword@localhost:5432/quizdb"
NEXTAUTH_SECRET="your-super-secret-key-change-this-to-random-string"
NEXTAUTH_URL="http://localhost:3000"
GMAIL_USER="your-email@gmail.com"
GMAIL_APP_PASSWORD="your-gmail-app-password"
```

**Getting Gmail App Password:**
1. Go to https://myaccount.google.com/apppasswords
2. Select "Mail" and "Other (Custom name)"
3. Generate and copy the 16-character password

### 4. Set Up the Database

```bash
# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate
```

### 5. Run the Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) 🎉

## 🐳 Docker Deployment

Run the entire stack with Docker:

```bash
# Build and start containers
docker-compose up --build

# Or run in background
docker-compose up -d
```

The application will be available at http://localhost:3000

To stop:
```bash
docker-compose down
```

## 📝 Quiz JSON Format

Download the template from the app or use this structure:

```json
[
  {
    "id": 1,
    "type": "multiple_choice",
    "topic": "Science",
    "question": "Which planet is known as the 'Red Planet'?",
    "options": ["Earth", "Mars", "Jupiter", "Venus"],
    "correct_answer": "Mars",
    "explanation": "Mars gets its reddish color from iron oxide."
  },
  {
    "id": 2,
    "type": "true_false",
    "topic": "Geography",
    "question": "The capital of Australia is Sydney.",
    "correct_answer": false,
    "explanation": "The capital of Australia is Canberra."
  },
  {
    "id": 3,
    "type": "fill_in_the_blank",
    "topic": "History",
    "question": "The year in which the Declaration of Independence was signed is [BLANK].",
    "correct_answer": ["1776"],
    "explanation": "The Declaration of Independence was signed on July 4, 1776."
  }
]
```

## 📂 Project Structure

```
Quiz/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── dashboard/         # User dashboard
│   ├── login/             # Authentication pages
│   ├── quiz/              # Quiz interface
│   └── ...
├── components/            # React components
│   ├── auth/             # Authentication components
│   ├── quiz/             # Quiz components
│   └── ui/               # Shadcn UI components
├── lib/                   # Utility functions
│   ├── prisma.ts         # Database client
│   ├── store.ts          # Zustand state management
│   └── ...
├── prisma/               # Database schema
├── public/               # Static assets
├── docker-compose.yml    # Docker configuration
└── Dockerfile           # Docker build instructions
```

## 🎯 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run database migrations
npm run prisma:studio    # Open Prisma Studio
npm run docker:up    # Start Docker containers
npm run docker:down  # Stop Docker containers
```

## 🔐 Security Features

- Password hashing with bcryptjs
- Email verification before login
- JWT-based session management
- Protected API routes
- User data isolation
- SQL injection prevention via Prisma

## 📸 Screenshots

[Add screenshots of your application here]

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 👤 Author

Built with ❤️ by [Your Name]

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/)
- [Shadcn UI](https://ui.shadcn.com/)
- [Prisma](https://www.prisma.io/)
- [NextAuth.js](https://next-auth.js.org/)
