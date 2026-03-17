# 📚 Quiz Platform — Complete Guide

> A modern, full-stack quiz platform for **students**, **teachers**, and **admins** — built with Next.js 14, PostgreSQL, and Prisma.

---

## 🌐 What Is This Website?

The **Quiz Platform** is an online education tool that lets anyone create, share, and take quizzes. It supports three types of users, each with different levels of access and control:

| Role | Who Is This For? |
|------|------------------|
| **Student** | Anyone who wants to take quizzes, join classes, and track their progress |
| **Teacher** | Educators who want to create class quizzes, manage students, and grade results |
| **Admin** | Platform administrators who oversee the entire system (users, classes, settings) |

---

## 🔐 Authentication & Accounts

| Feature | Description |
|---------|-------------|
| **Register** | Sign up with your email and a password |
| **Email Verification** | A verification email is sent via Gmail — you must verify your email before you can log in |
| **Login** | Log in with your verified email and password |
| **Forgot Password** | Request a password reset link sent to your email |
| **Reset Password** | Set a new password through the reset link |
| **Profile & Settings** | Update your name, profile picture, theme (light/dark/system), default time limit, and notification preferences |

---

## 🎓 What Can a Student Do?

### Dashboard
- View your quiz stats at a glance (quizzes taken, average score, etc.)

### Take a Personal Quiz
1. **Download the JSON Template** — from the home page
2. **Fill it with questions** — supports three question types:
   - **Multiple Choice** — pick one correct answer from a list
   - **True / False** — answer true or false
   - **Fill in the Blank** — type the correct answer
3. **Upload the JSON** — go to **New Quiz** (setup page) and upload your file
4. **Set a Time Limit** — optionally add a timer (auto-submits when time runs out)
5. **Start the Quiz** — answer questions one by one
6. **View Results** — immediately see your score, percentage, and explanations for each question

### AI-Powered Quiz Creation
- Download the blank JSON template and upload it to **ChatGPT** or **Claude**
- Use the provided AI prompts on the home page to generate a quiz on any topic
- Download the AI-generated JSON and upload it to start quizzing

### Join a Class
- **Enter a Class Code** — if a teacher gives you their class code, you can join directly
- **Accept an Invitation** — teachers can send email invitations; you'll see them under **Invitations**

### My Classes (as a student)
- View all the classes you've joined
- See assigned class quizzes and their **start/end times**
- Take class quizzes within the allowed time window
- View your attempts, scores, and whether retakes are available

### Quiz History
- See all your past quiz results (personal and class quizzes)
- Review your answers, correct answers, and explanations
- Track your improvement over time

### Settings
- Change your **theme** (Light / Dark / System)
- Set your **default quiz time limit**
- Toggle **show explanations** after quizzes
- Toggle **email notifications**

---

## 👨‍🏫 What Can a Teacher Do?

> **Becoming a Teacher:** Students can apply to become a teacher by going to the **"Become a Teacher"** page. You'll need to submit your institution name and a reason. An admin reviews and either approves or rejects your application.

### My Classes (Teaching)
- **Create a new class** with a name, description, and auto-generated unique class code
- **Invite students** by email — they receive an invitation link
- **View class members** — see who has joined

### Class Quizzes
- **Create class quizzes** with:
  - A name and description
  - Questions (same JSON format — multiple choice, true/false, fill-in-the-blank)
  - A **duration** (time limit per attempt)
  - A **start time** and **end time** (quiz availability window)
  - Options to **shuffle questions**, **show results** to students, and **allow retakes**
  - Configure **max attempts** allowed

### Managing Student Performance
- **View all student attempts** — see who submitted, their scores, and time taken
- **Grant retakes** — give individual students or the whole class an extra attempt with an expiry date and reason
- **Modify scores** — manually adjust a student's score with a reason
- **Apply question corrections** — if a question was incorrect or ambiguous, give bonus points to all students who answered it

### Enrolled Classes (as a learner)
- Teachers can also **join other teachers' classes** as a student and take quizzes

---

## 🛡️ What Can an Admin Do?

### Admin Dashboard
- View platform-wide stats: total users, teachers, classes, quizzes
- See a **donut chart** of user distribution (students / teachers / admins)
- See **pending teacher applications** with quick review access
- View **recent admin activity logs**

### Manage Users
- View all registered users (search, filter by role)
- **Change user roles** (promote to teacher/admin or demote)
- **Activate / Deactivate** user accounts

### Teacher Applications
- **Review** pending teacher applications
- **Approve** — promotes the user to teacher role
- **Reject** — with an optional review note

### Manage Classes
- View all classes across the platform
- See class details, members, and quizzes

### Manage Quizzes
- View all quizzes (personal and class quizzes)

### Approved Domains
- **Add approved email domains** (e.g., `@university.edu`) — these can be used to auto-approve teacher applications or control registration

### Admin Logs
- Full audit trail of all admin actions (approve/reject teacher, role changes, score modifications, etc.)

### System Settings
- Configure the **site name**
- Toggle **open registration** on/off
- Toggle **email verification requirement**

---

## 📬 Notifications

- Users receive in-app notifications for important events (e.g., teacher application updates, class invitations, quiz availability)
- Notifications can be of types: **INFO**, **SUCCESS**, **WARNING**, or **ERROR**
- Each notification can link to a relevant page
- Mark as read / unread

---

## 🎨 User Interface

| Feature | Description |
|---------|-------------|
| **Dark / Light Mode** | Full theme support — switch in settings or nav bar |
| **Responsive Design** | Works on desktop, tablet, and mobile |
| **Sidebar Navigation** | Collapsible sidebar for students and teachers with role-specific menu items |
| **Animations** | Smooth transitions and micro-animations via Framer Motion |
| **Modern UI Components** | Built with Shadcn UI — buttons, cards, dialogs, toasts, etc. |

---

## 🧩 Tech Stack (for developers)

| Technology | Purpose |
|-----------|---------|
| **Next.js 14** (App Router) | Full-stack React framework |
| **TypeScript** | Type-safe development |
| **PostgreSQL** | Relational database |
| **Prisma ORM** | Database queries and migrations |
| **NextAuth v5** (Auth.js) | Authentication (credentials provider, JWT sessions) |
| **Tailwind CSS** | Utility-first styling |
| **Shadcn UI** | Pre-built accessible component library |
| **Zustand** | Lightweight state management |
| **Framer Motion** | Animations |
| **Nodemailer** | Email sending (Gmail SMTP) |
| **Docker** | Containerized deployment |

---

## 📝 Quiz JSON Format

The platform uses a simple JSON format for quizzes. Download the template from the home page:

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
    "question": "The year the Declaration of Independence was signed is [BLANK].",
    "correct_answer": ["1776"],
    "explanation": "It was signed on July 4, 1776."
  }
]
```

---

## 🚀 Quick Start (how to run locally)

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables (copy and edit .env)
cp .env.example .env

# 3. Generate Prisma client & run migrations
npm run prisma:generate
npm run prisma:migrate

# 4. Start the dev server
npm run dev
```

Visit **http://localhost:3000** 🎉

---

## 🐳 Docker Deployment

```bash
# Build and start everything
docker-compose up --build

# Or run in the background
docker-compose up -d
```

---

*Built with ❤️ using Next.js, Prisma, and Shadcn UI*
