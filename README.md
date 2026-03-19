
# Education Platform

A comprehensive full-stack education platform built with a microservices architecture. It includes a modern, responsive React frontend (using Radix UI / Shadcn UI) and a robust Java Spring Boot backend. 

## 🏗️ Project Architecture

### Frontend (`/src`)
- **Framework:** React 18, Vite, TypeScript
- **Styling:** Tailwind CSS, Radix UI primitives
- **Routing:** React Router DOM
- **Features:** 
  - Guest, Student, Teacher, and Admin portals.
  - Interactive dashboards with Chart.js.
  - Integration with backend services.

### Backend (`/backend`)
The backend is structured as a collection of microservices:
- **`onlineCourses/`**: Spring Boot Cloud Architecture.
  - **`eureka-server/`**: Service Discovery.
  - **`api-gateway/`**: Single entry point for routing requests.
  - **`courses-service/`**: Course management.
  - **`lesson-service/`**: Lesson management.
  - **`statistic-service/`**: Analytics and reporting.
  - **`user-service/`**: User authentication and profile management.
- **`payment/`**: Handling transactions and checkout flows.
- **`chatbot-proxy/`**: A Node.js proxy service handling AI-based chatbot interactions for students.

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Java (JDK 17+)
- Maven
- Docker & Docker Compose

### 🖥️ Running the Frontend

Navigate to the root directory and install dependencies:
```bash
npm install
```

Start the development server:
```bash
npm run dev
```

*Troubleshooting npm issues on Windows:*
If you encounter `ExecutionPolicy` errors or conflicted module installations, you can reset your environment by running:
```powershell
Set-ExecutionPolicy -ExecutionPolicy Unrestricted -Scope CurrentUser
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

### 🐳 Running the Backend (Docker)

The project includes Docker support to quickly spin up the complete backend architecture, including databases. From the root directory, run:

```bash
docker-compose up --build
```
*Note: Make sure your Docker daemon is running. This will initialize the MySQL databases using `backend/docker-init-db.sql` and start all required microservices.*

## 📂 Project Structure Overview

- `/src/components/`: Modular React components grouped by role (`admin/`, `auth/`, `guest/`, `student/`, `teacher/`, `ui/`).
- `/backend/onlineCourses/`: Core Spring Boot microservices.
- `/backend/chatbot-proxy/`: Node/Express based chatbot integration.
- `/docker-compose.yml`: Orchestrates the microservice cluster and databases.
- `/flowchart drawio/`: System architecture and user flow diagrams (`auth`, `chatbot`, `payment`, etc.).
- `/defense/`: Resources and checklists for project defense.

## 📝 License
This project is for educational purposes.
