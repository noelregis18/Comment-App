# Comment Application

A minimalistic and highly scalable comment application with nested comments, user authentication, and notifications. This project emphasizes backend performance, clean architecture, and Docker-based containerization.

## Features

- 🔐 **User Authentication**: Secure login required to access and interact with the app.
- 🧵 **Nested Comments**: Support for replies within replies, with multiple levels of nesting.
- ✏️ **Editability**: Comments can be edited only within 15 minutes of posting.
- 🗑️ **Deletion & Restoration**: Users can delete comments and restore them within a 15-minute grace period.
- 🔔 **Notification System**: Notify users when they receive a reply with read/unread toggle.

## Tech Stack

- **Backend**: NestJS with TypeScript
- **Frontend**: Next.js with TypeScript
- **Database**: PostgreSQL
- **Containerization**: Docker and Docker Compose

## Prerequisites

- [Docker](https://www.docker.com/get-started)
- [Docker Compose](https://docs.docker.com/compose/install/)

## Getting Started

### Running with Docker

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd <repository-directory>
   ```

2. Create a `.env` file in the project root with the following variables:
   ```
   JWT_SECRET=your_jwt_secret_here
   ```

3. Start the application using Docker Compose:
   ```bash
   docker-compose up
   ```

4. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - API Documentation: http://localhost:3001/api/docs

### Running Locally (Development)

#### Backend

1. Navigate to the API directory:
   ```bash
   cd api
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with the following variables:
   ```
   DATABASE_HOST=localhost
   DATABASE_PORT=5432
   DATABASE_USER=postgres
   DATABASE_PASSWORD=postgres
   DATABASE_NAME=comment_app
   JWT_SECRET=your_jwt_secret_here
   ```

4. Start the development server:
   ```bash
   npm run start:dev
   ```

#### Frontend

1. Navigate to the UI directory:
   ```bash
   cd ui
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file with the following variables:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:3001
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Architecture

### Backend Structure

The backend is structured using a clean architecture approach with the following modules:

- **auth**: Handles user authentication and JWT tokens
- **users**: Manages user profiles and authentication
- **comments**: Core functionality for creating, editing, and managing comments
- **notifications**: Handles notification creation and management

### Database Structure

The application uses PostgreSQL with the following main tables:

- **users**: Stores user information
- **comments**: Stores comment data with self-references for nested comments
- **notifications**: Tracks notifications between users

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST   | /auth/register | Register a new user |
| POST   | /auth/login | Authenticate a user |
| GET    | /users/profile | Get current user profile |
| GET    | /comments | Get all comments |
| POST   | /comments | Create a new comment |
| PUT    | /comments/:id | Update a comment |
| DELETE | /comments/:id | Delete a comment |
| POST   | /comments/:id/restore | Restore a deleted comment |
| GET    | /notifications | Get user notifications |
| PUT    | /notifications/:id/read | Mark notification as read |
| PUT    | /notifications/read-all | Mark all notifications as read |

## Scalability Considerations

- **Database Indexing**: Optimized queries with proper indexing
- **Stateless Architecture**: Allows horizontal scaling of API services
- **Docker Containerization**: Easy deployment and scaling
- **Clean Architecture**: Separation of concerns for easier maintenance

## Future Improvements

- Real-time notifications using WebSockets
- Pagination for comments and notifications
- Media attachments for comments
- User roles and permissions
- Full text search for comments 
