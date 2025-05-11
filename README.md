<p align="center">
  <img src="public/image.png" width="400" alt="amMentor Logo" />
</p>
<p align="center">
  A gamified mentorship platform built with NextJs
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
amMentorbeing developed separately for web and [mobile](https://github.com/ganidande905/amMentor) using dedicated tech stacks for each, designed to transform traditional mentorship into an engaging, gamified experience. Web version built using NextJs, it empowers mentees to progress through curated learning tracks under the guidance of experienced mentors. The system emphasizes accountability, growth, and engagement with features like leaderboards, task management, and achievement recognition.

The application provides distinct interfaces for two primary user roles:

- **Mentors**: Experienced guides who review tasks and support mentees
- **Mentees**: Learners who complete tasks across various tracks to gain points and recognition
  
<img width="1351" alt="Screenshot 2025-05-04 at 2 22 35 PM" src="https://github.com/user-attachments/assets/987245cc-3ac9-40c8-947c-af0331914bfa" />


## Technical Foundation
amMentor-Web is built on a modern web technology stack, utilizing Next.js 15.3.0 as its framework foundation with React 19.0.0 for component-based UI development. The application is implemented in TypeScript for type safety and uses Tailwind CSS for styling.

<img width="1359" alt="Screenshot 2025-05-04 at 2 28 17 PM" src="https://github.com/user-attachments/assets/4fede214-8a49-4160-9c03-28e98f6b7ef5" />

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

<img width="1304" alt="Screenshot 2025-05-04 at 2 29 13 PM" src="https://github.com/user-attachments/assets/8d9b3b29-8f4f-497e-a496-20098de88d71" />


## Application Structure
The application follows a structured routing pattern centered around two main sections:

<img width="1352" alt="Screenshot 2025-05-04 at 2 30 14 PM" src="https://github.com/user-attachments/assets/74ac97d7-aaa1-47f8-914f-83a2a6cfb2d3" />


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
   cd amMentor-Web
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
