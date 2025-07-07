# Value Builder Assessment™ - Replit Development Guide

## Overview

This is a comprehensive business assessment application built with React, Node.js/Express, and PostgreSQL. The application provides a professional-grade evaluation tool for businesses to assess their company value across 14 key dimensions through a structured questionnaire system.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **UI Library**: Radix UI components with shadcn/ui styling system
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: React Query (@tanstack/react-query) for server state
- **Routing**: Wouter for client-side routing
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (@neondatabase/serverless)
- **Email Service**: Nodemailer for SMTP communication
- **Session Management**: connect-pg-simple for PostgreSQL session storage

### Build & Development
- **Build Tool**: Vite for frontend bundling
- **Backend Build**: esbuild for server-side bundling
- **Development**: tsx for TypeScript execution
- **CSS Processing**: PostCSS with Tailwind CSS and Autoprefixer

## Key Components

### Assessment Engine
- **Structure**: 128 questions across 14 assessment dimensions
- **Scoring**: Weighted scoring system with category-specific calculations
- **Progress Tracking**: Real-time progress saving and restoration
- **Session Management**: Unique session IDs for assessment continuity

### Database Schema
- **Assessments Table**: Stores assessment progress and completion status
- **Results Table**: Stores final assessment results with user information
- **Session Management**: PostgreSQL-based session storage

### Email Integration
- **SMTP Configuration**: Configurable email service for result delivery
- **Result Distribution**: Automated email sending to users and administrators
- **Template System**: Structured email templates for assessment results

### UI Components
- **Assessment Screens**: Welcome, Assessment, and Results screens
- **Progress Tracking**: Visual progress indicators and section navigation
- **Form Management**: Comprehensive form validation and error handling
- **Toast Notifications**: User feedback system for actions and errors

## Data Flow

1. **Assessment Initiation**: User begins assessment on welcome screen
2. **Session Creation**: Unique session ID generated for tracking
3. **Question Progression**: User progresses through weighted questions
4. **Progress Persistence**: Answers automatically saved to database
5. **Score Calculation**: Real-time category and overall score computation
6. **Result Submission**: User provides contact information for results
7. **Email Delivery**: Results sent to user and administrative team

## External Dependencies

### Database
- **Neon Database**: Serverless PostgreSQL database
- **Drizzle ORM**: Type-safe database interactions
- **Migration Management**: Drizzle Kit for schema migrations

### Email Service
- **Nodemailer**: SMTP email delivery
- **Configuration**: Environment-based SMTP settings
- **Templates**: Structured email formatting

### UI Framework
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library
- **Date-fns**: Date manipulation utilities

## Deployment Strategy

### Production Build
```bash
npm run build  # Builds both frontend and backend
npm run start  # Starts production server
```

### Development Environment
```bash
npm run dev    # Starts development server with hot reload
npm run check  # TypeScript type checking
```

### Database Management
```bash
npm run db:push  # Push schema changes to database
```

### Environment Configuration
- **DATABASE_URL**: PostgreSQL connection string
- **SMTP_HOST**: Email server hostname
- **SMTP_PORT**: Email server port
- **SMTP_USER**: Email authentication username
- **SMTP_PASS**: Email authentication password

## Changelog

Changelog:
- July 07, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.