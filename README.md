# 🚀 Toonza

> AI-powered creative workspace for generating images, creating stories, generating voices, and managing creator assets.

**Toonza** is a full-stack AI SaaS platform built with the **MERN stack** that brings multiple AI-powered creator tools into a single workspace.

The platform allows users to generate and manage AI images, work with story and dialogue content, generate voice output, and access reusable creative assets such as backgrounds, sound effects, and background music.

The project also implements a production-oriented backend architecture with **Redis, BullMQ, Docker, cloud services, and automated CI/CD**.

---

## ✨ Features

### 🔐 Authentication & Authorization

* User registration and login
* JWT-based authentication
* Access and refresh token mechanism
* HTTP-only cookies
* Protected API routes
* User-specific data and resources

---

### 🎨 AI Image Generation

* Generate images from text prompts
* Multiple visual styles
* Configurable image ratios
* Generate multiple images
* Storybook/scene-based image generation
* Image generation history
* Image groups organized by date
* Public/private image support
* AI-powered image enhancement

---

### 📖 Story & Dialogue Tools

Toonza provides tools for working with stories and dialogue-based content.

* Story-focused content workflow
* Dialogue separator
* Automatically separate dialogues from a story/script
* Character-wise dialogue organization
* Structured dialogue output for voice generation
* Storybook-oriented image generation workflow

---

### 🎙️ Voice Generation

* Convert text/dialogues into speech
* Generate voice from separated dialogues
* Character-oriented voice workflow
* Useful for narration and animated/story content
* Integrates voice generation into the overall story creation workflow

---

### 📚 Creator Asset Library

Toonza includes a reusable asset library for content creators.

* Background images
* Sound effects (SFX)
* Background music (BGM)
* Asset categorization
* Tags and metadata
* Searchable/reusable creator assets
* Centralized asset management

---

### 🌎 Community

* Publish generated images
* Public image feed
* Share generated content
* Browse community-generated content
* User-generated content discovery

---

### 💳 Credit System

* Credit-based AI generation
* User credit tracking
* Server-side credit validation
* Credit deduction for AI operations
* Stripe-based plan/credit integration

---

### ⚡ Asynchronous Image Processing

To handle long-running image-generation operations, Toonza supports background job processing using **Redis and BullMQ**.

* Redis-backed job queue
* BullMQ job management
* Dedicated background worker
* Job status tracking
* Frontend polling
* Separation of request handling and image processing
* Environment-based asynchronous/synchronous processing

---

### 🐳 Docker & Containerization

* Dockerized frontend
* Dockerized backend
* Docker Compose for local development
* Redis container
* Separate BullMQ worker
* Reproducible local development environment

---

### 🔄 CI/CD

The project includes an automated CI/CD pipeline using GitHub Actions.

* Automated dependency installation
* Frontend build validation
* Docker image builds
* Docker Hub image publishing
* Automated Render deployment using Deploy Hooks
* Deployment triggered by pushes to the `main` branch

---

# 🏗️ Tech Stack

## Frontend

* React
* Vite
* Tailwind CSS
* Framer Motion
* Axios

## Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT
* Cookie Parser
* Multer

## AI & Media

* Hugging Face / Replicate
* AI image generation
* Voice generation
* Custom Storybook generation service
* Cloudinary

## Infrastructure & DevOps

* Docker
* Docker Compose
* Redis
* BullMQ
* GitHub Actions
* Docker Hub
* Render
* Vercel
* MongoDB Atlas

---

# 🧩 System Architecture


                              ┌──────────────────┐
                              │       User       │
                              └────────┬─────────┘
                                       │
                                       ▼
                              ┌──────────────────┐
                              │      Vercel      │
                              │ React Frontend   │
                              └────────┬─────────┘
                                       │
                                  HTTPS / REST
                                       │
                                       ▼
                              ┌──────────────────┐
                              │      Render      │
                              │  Node / Express  │
                              │     Backend      │
                              └────┬────┬────┬───┘
                                   │    │    │
                    ┌──────────────┘    │    └───────────────┐
                    ▼                   ▼                    ▼
             ┌────────────┐     ┌────────────┐      ┌──────────────┐
             │  MongoDB   │     │ Cloudinary │      │ AI Providers │
             │   Atlas    │     │   Storage  │      │ HF / Replicate│
             └────────────┘     └────────────┘      └──────────────┘


                         Local Background Processing
                                       │
                                       ▼
                              ┌──────────────────┐
                              │      Redis       │
                              └────────┬─────────┘
                                       │
                                       ▼
                              ┌──────────────────┐
                              │      BullMQ       │
                              │     Job Queue     │
                              └────────┬─────────┘
                                       │
                                       ▼
                              ┌──────────────────┐
                              │   Image Worker   │
                              │ Background Jobs  │
                              └──────────────────┘


# 🔄 Image Generation Flow

## Local Development

During local development, image generation can be processed asynchronously through BullMQ.

User submits prompt
        ↓
React Frontend
        ↓
POST /imageGroup/generate
        ↓
Backend Controller
        ↓
Create BullMQ Job
        ↓
Redis Queue
        ↓
BullMQ Worker
        ↓
Image Generation Service
        ↓
AI Provider
        ↓
Cloudinary Upload
        ↓
MongoDB ImageGroup
        ↓
Job Completed
        ↓
Frontend polls Job Status
        ↓
Updated Image History


The frontend receives a `jobId` instead of waiting for the complete image-generation process.

It periodically requests:

GET /api/v1/imageGroup/job-status/:jobId


until the job is completed or fails.



## Production

The current production environment uses synchronous processing because a dedicated BullMQ worker is not deployed there.


User submits prompt
        ↓
React Frontend
        ↓
Render Backend
        ↓
Backend Controller
        ↓
Image Generation Service
        ↓
AI Provider
        ↓
Cloudinary
        ↓
MongoDB
        ↓
Response
        ↓
Frontend updates UI


The behavior is controlled through:


USE_BULLMQ=true


for local asynchronous processing and:

USE_BULLMQ=false

for the current production configuration.

This allows the same image-generation service to work with different execution strategies without duplicating the core business logic.

---

# 🧠 Service Architecture

The image-generation logic is separated from the HTTP controller and BullMQ worker.

                 ┌──────────────────┐
                 │   API Controller │
                 └────────┬─────────┘
                          │
                          ▼
              ┌────────────────────────┐
              │ Image Generation       │
              │       Service          │
              └───────────┬────────────┘
                          │
            ┌─────────────┼──────────────┐
            ▼             ▼              ▼
       AI Provider     Cloudinary      MongoDB

For asynchronous processing:

Controller
     │
     ▼
BullMQ Queue
     │
     ▼
Redis
     │
     ▼
Worker
     │
     ▼
Image Generation Service

This separation helps keep:

* Controllers focused on HTTP concerns
* Workers focused on background processing
* Services responsible for business logic

---

# 🐳 Docker Architecture

Local development uses Docker Compose.

Docker Compose
│
├── Frontend
│   └── React / Vite
│
├── Backend
│   └── Node.js / Express
│
├── Redis
│   └── Queue Storage
│
└── Worker
    └── BullMQ Image Processing

Docker provides isolated and reproducible environments for the application's services.


# 🔄 CI/CD Pipeline

Every push to the `main` branch triggers the GitHub Actions workflow.

Developer
    │
    │ git push
    ▼
 GitHub
    │
    ▼
GitHub Actions
    │
    ├── Checkout repository
    │
    ├── Install backend dependencies
    │
    ├── Install frontend dependencies
    │
    ├── Build frontend
    │
    ├── Build backend Docker image
    │
    ├── Push backend image → Docker Hub
    │
    ├── Build frontend Docker image
    │
    ├── Push frontend image → Docker Hub
    │
    └── Trigger Render Deploy Hook
                    │
                    ▼
              Render Deployment

The pipeline automatically validates and builds the project and triggers the backend deployment after changes are pushed to `main`.



# 📁 Project Structure

Toonza/
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── models/
│   │   ├── middleware/
│   │   ├── services/
│   │   ├── queues/
│   │   ├── workers/
│   │   ├── config/
│   │   ├── db/
│   │   └── index.js
│   │
│   ├── Dockerfile
│   ├── .dockerignore
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── ...
│   │
│   ├── Dockerfile
│   └── package.json
│
├── .github/
│   └── workflows/
│       └── ci.yml
│
├── docker-compose.yml
└── README.md



# 🚀 Deployment

| Component          | Platform         |
| ------------------ | ---------------- |
| Frontend           | Vercel           |
| Backend            | Render           |
| Database           | MongoDB Atlas    |
| Image Storage      | Cloudinary       |
| Redis              | Render Key Value |
| Container Registry | Docker Hub       |
| CI/CD              | GitHub Actions   |

---

# 🔒 Security Considerations

* JWT-based authentication
* HTTP-only cookies
* Protected API routes
* Server-side credit validation
* Environment variables for secrets
* CORS configuration
* Secrets excluded through `.gitignore`
* Separate development and production configuration
* Backend-side validation of user operations

---

# 📌 Future Improvements

Potential future improvements include:

* Automated unit and integration testing
* API rate limiting
* Improved BullMQ retry strategies
* Job prioritization
* BullMQ monitoring/dashboard
* Structured application logging
* Better observability
* Production-grade background workers
* Improved caching strategies
* Automated database backups
* More granular role-based authorization

---

# 🎯 Key Engineering Concepts Demonstrated

This project provided practical experience with:

* Full-stack MERN development
* REST API design
* JWT authentication and authorization
* HTTP-only cookies
* AI API integration
* Image generation workflows
* Voice generation workflows
* Dialogue processing
* Cloud media storage
* Redis
* BullMQ
* Background job processing
* Job status tracking
* Docker
* Docker Compose
* Git and GitHub
* GitHub Actions
* CI/CD
* Docker Hub
* Cloud deployment
* Environment-based configuration
* Separation of concerns
* Service-oriented backend architecture

---

# 💡 Key Technical Decisions

### Why Redis + BullMQ?

Image generation can be a long-running operation. Instead of keeping an HTTP request open while the AI provider processes the request, the application can create a background job and return a job ID.

This improves separation between API request handling and resource-intensive processing.

### Why a separate image-generation service?

The image-generation business logic is shared between the API controller and the background worker.

Moving this logic into a service avoids duplication and keeps controllers and workers focused on their respective responsibilities.

### Why Docker?

Docker provides consistent environments across development and deployment and allows the frontend, backend, Redis, and worker to run as isolated services.

### Why CI/CD?

GitHub Actions automates build validation, Docker image creation, Docker Hub publishing, and backend deployment, reducing manual deployment steps.

---

# 🌟 Project Highlights

Toonza combines several components that are commonly found in modern full-stack applications:

MERN
 +
AI APIs
 +
Cloud Storage
 +
Redis
 +
BullMQ
 +
Docker
 +
CI/CD
 +
Cloud Deployment


Rather than being only an AI image-generation application, Toonza is designed as a **creator-focused AI platform** combining image generation, story/dialogue tools, voice generation, and reusable media assets.


# ⭐ Project Status

🚀 **Learning-focused production-style AI SaaS application**

The project is actively developed with a focus on full-stack engineering, AI integration, asynchronous processing, containerization, and cloud deployment.
