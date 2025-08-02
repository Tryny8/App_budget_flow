# Budget Management Application

## Overview

This is a full-stack budget management application built with React, Express.js, and PostgreSQL. The application allows users to track their income and expenses through an intuitive dashboard interface. Users can add, edit, and delete income sources and deductions, with categorization and frequency management features. The application is designed with a modern UI using shadcn/ui components and Tailwind CSS for styling.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Features Added

### Monthly Tracking System (Added August 2024)
- **Suivi Mensuel Tab**: Real-time view of processed vs pending transactions based on current date
- **Date-Based Filtering**: Automatic categorization of income/deductions as "received" or "pending"
- **Current Budget Calculation**: Shows actual available budget based on transactions processed so far

### Projection System (Added August 2024)  
- **Projection Tab**: Multi-date budget forecasting with interactive controls
- **Customizable Projection Dates**: User can add/remove specific dates (2-5 dates) for detailed analysis
- **Interactive Line Chart**: Visual representation of budget evolution throughout the month using Recharts
- **Detailed Breakdown**: Date-by-date analysis showing cumulative incomes, deductions, and available budget
- **Visual Status Indicators**: Clear distinction between past dates, current date, and future projections

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite as the build tool
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming support
- **State Management**: TanStack Query (React Query) for server state management
- **Form Handling**: React Hook Form with Zod validation
- **Routing**: Wouter for lightweight client-side routing
- **Component Structure**: Organized component library with reusable UI primitives
- **Data Visualization**: Recharts library for budget projection charts and financial analytics

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **API Design**: RESTful API structure with dedicated routes for income and deduction management
- **Data Validation**: Zod schemas for request validation and type safety
- **Error Handling**: Centralized error handling middleware
- **Development Setup**: Hot reload with Vite integration in development mode

### Data Storage
- **Database**: PostgreSQL with Neon serverless driver
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema Management**: Drizzle Kit for migrations and schema synchronization
- **Storage Abstraction**: Interface-based storage layer with in-memory implementation for development

### Database Schema
- **Users Table**: Basic user authentication with username/password
- **Incomes Table**: Income tracking with description, amount, frequency (monthly/weekly/yearly), and income date (day of month 1-31)
- **Deductions Table**: Expense tracking with categorization (housing, transport, utilities, etc.) and deduction date (day of month 1-31)

### Authentication & Authorization
- Currently implements basic user structure but authentication middleware is not yet active
- Session management infrastructure prepared with connect-pg-simple for PostgreSQL session storage

### API Structure
- **Income Endpoints**: GET, POST, PUT operations for income management with date tracking
- **Deduction Endpoints**: Similar CRUD operations for expense tracking with date scheduling
- **Monthly Tracking**: Date-based filtering to determine processed vs pending transactions
- **Validation Layer**: Request validation using Zod schemas before database operations
- **Response Format**: Consistent JSON responses with proper HTTP status codes

### Build & Deployment
- **Development**: Concurrent frontend (Vite) and backend (tsx) servers
- **Production Build**: Static frontend build with bundled backend using esbuild
- **Environment**: Environment-based configuration with DATABASE_URL for database connection

### Development Tools
- **Type Safety**: Full TypeScript coverage across frontend, backend, and shared schemas
- **Code Quality**: Consistent import paths and module resolution
- **Development Experience**: Hot reload, error overlays, and development banners for Replit environment