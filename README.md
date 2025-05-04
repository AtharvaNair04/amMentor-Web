<p align="center">
  <img src="public/image.png" width="400" alt="amMentor Logo" />
</p>
<p align="center">
  A gamified mentorship platform built with Flutter.
</p>

<p align="center">
    <a href="https://github.com/vercel/next.js">
    <img src="https://img.shields.io/badge/Platform-Next.js-blue" alt="Web App" />
  </a>
  <a href="https://github.com/django/django">
    <img src="https://img.shields.io/badge/API-Django-green" alt="Django" />
  </a>
  <a href="https://github.com/ganidande905/amMentor">
    <img src="https://img.shields.io/badge/Mobile-Flutter-orange" alt="Mobile App" />
  </a>
  <a href="https://github.com/naveen28204280/amMentor_Backend">
    <img src="https://img.shields.io/badge/Common-Backend-green" alt="Backend" />
  </a>
  <a href="https://deepwiki.com/ganidande905/amMentor-Web">
    <img src="https://img.shields.io/badge/Docs-DeepWiki-blueviolet" alt="Docs" />
  </a>
  <a href="#contributing-guidelines">
    <img src="https://img.shields.io/badge/contributions-welcome-brightgreen.svg" alt="Contributions Welcome" />
  </a>
</p>


## Overview
amMentor is a cross-platform application built for both [mobile](https://github.com/ganidande905/amMentor) and web, designed to transform traditional mentorship into an engaging, gamified experience. Built using Flutter, it empowers mentees to progress through curated learning tracks under the guidance of experienced mentors. The system emphasizes accountability, growth, and engagement with features like leaderboards, task management, and achievement recognition.

The application provides distinct interfaces for two primary user roles:

- **Mentors**: Experienced guides who review tasks and support mentees
- **Mentees**: Learners who complete tasks across various tracks to gain points and recognition


## Technical Foundation
amMentor-Web is built on a modern web technology stack, utilizing Next.js 15.3.0 as its framework foundation with React 19.0.0 for component-based UI development. The application is implemented in TypeScript for type safety and uses Tailwind CSS for styling.
## Key Features

| Feature               | Description                                                                 |
|-----------------------|-----------------------------------------------------------------------------|
| Role-Based Access     | Different interfaces for mentors and mentees with separate navigation flows |
| OTP Authentication    | Email-based one-time password verification for secure login                 |
| Track-Based Learning  | Domain-specific learning paths (e.g., AI, Web Dev) with track selection     |
| Leaderboard System    | Competitive ranking based on points and achievements with animated display  |
| Task Management       | Assignment, submission, and review of learning tasks                        |
| Profile Management    | User profiles with progress tracking and statistics                         |

## User Flow
The application implements a role-based user flow, starting from common authentication and diverging into role-specific experiences:

## Application Structure
The application follows a structured routing pattern centered around two main sections:

## Development and Extension

The amMentor platform uses NextJs and Flutter's cross-platform capabilities to target both Android and iOS environments, with consistent styling through a centralized theme configuration. The application architecture supports extension through:

- **Additional Tracks:** New learning paths can be added to the track selection system
- **Enhanced Gamification:** The leaderboard and point system can be expanded
- **New Task Types:** The task management system can incorporate different types of assignments

## Web & Backend Versions

This project also includes:

- **[Mobile Version](https://github.com/ganidande905/amMentor)** — Built with Flutter.
- **[Common Backend](https://github.com/naveen28204280/amMentor_Backend)** — Powered by Django and REST API.

All platforms share the same backend for authentication, track management, leaderboard syncing, and progress tracking.

## Contributing Guidelines

1. **Fork** this repository
2. **Clone** your fork locally:

   ```bash
   git clone https://github.com/your-username/amMentor-Web.git
   cd amMentor
   ```
3. **Install** dependencies:

    ```bash
    npm install
    # or
    yarn install
    ```
4. **Create** a new branch:

    ```bash 
    git checkout -b your-feature-name
    ```
5. **Start** the deployment server :
    ```bash
    npm run dev
    # or
    yarn dev
    ```
### What You Can Work On
- UI enhancements (e.g., animations, responsiveness)
- New features (e.g., badges, notifications)
- Bug fixes
- Test cases
- Code refactoring and lint cleanup
- Improving documentation (README, onboarding guide, etc.)
### Coding Guidelines
- Use **Riverpod** for state management
- Follow **Flutter/Dart best practices and format the code with:**

    ```bash
    npm run lint
    npm run format
    ```
- Keep UI and business logic seperated
- Use meaningful commit messages : 

    ```
    feat: add track selection UI
    fix: leaderboard animation glitch
    ```
### Pull Request Process

1. Push you changes to your fork :

    ```bash
    git push origin your-feature-name
    ```
2.	Open a Pull Request (PR) against the main branch.
3.	Provide a clear description of:
    - What your PR does
    - Related issue (if any)
    - Screenshots or screen recordings (if it’s UI related)