# Zyven

<p align="center">
  <strong>AI-powered React UI component generation platform.</strong>
</p>

<p align="center">
  Generate • Preview • Save • Reuse
</p>

<p align="center">
  <img src="client/public/img.png" alt="Zyven" width="120" />
</p>

---

## Overview

**Zyven** is an AI-powered UI component generation platform built for developers who want to create React components faster.

Instead of manually writing every component from scratch, developers can describe what they need using natural language. Zyven sends the request to an AI model through OpenRouter, receives the generated React component, renders it in a live preview, and allows the developer to save the component to their personal library.

The core idea is simple:

> **Describe your UI → Generate it → Preview it → Save what you like.**

Zyven combines AI generation, live React rendering, authentication, component management, AI credits, and Razorpay payments into one application.

---

## ✨ Features

### 🤖 AI Component Generation

Generate React UI components using natural-language prompts.

- Natural-language component prompts
- AI-generated React/JSX
- OpenRouter-powered generation
- Nvidia Nemotron model
- AI credit-based generation system
- Server-side response validation

### ⚡ Live Component Preview

Generated components can be previewed directly inside the browser.

- Real-time React rendering
- `react-live` based preview
- Generated code sanitization
- Import/export cleanup
- Invalid code protection
- Preview fallback handling

### 💾 Personal Component Library

Generated components are **not automatically saved**.

A component becomes permanent only when the user explicitly clicks **Save**.

- User-controlled saving
- Personal component library
- MongoDB persistence
- User-specific component ownership
- Duplicate protection
- Components remain available after refresh/login

### 🔐 Authentication

Zyven provides secure authentication using:

- Firebase Google Authentication
- JWT
- HTTP-only cookies
- Protected backend routes
- User-specific data access

### 💳 AI Credits & Payments

Zyven uses an AI credit system for component generation.

Users can purchase additional credits through Razorpay.

- Razorpay order creation
- Secure payment verification
- HMAC SHA-256 signature validation
- Automatic credit updates
- Duplicate payment protection

### 🌐 Component Discovery

Zyven also provides a public component area where users can explore available components.

### 👨‍💻 Developer-Friendly Code

Generated components can be viewed as code and reused directly in other React projects.

---

# 🏗️ Architecture

```mermaid
flowchart TB

    User([👤 User])

    subgraph Client["Zyven Client"]
        UI["React + Vite"]
        AuthUI["Authentication"]
        Generate["Generate"]
        Preview["Live Preview"]
        MyComponents["My Components"]
        AllComponents["All Components"]
        Pricing["Pricing"]
    end

    subgraph Server["Zyven Server"]
        Express["Express API"]
        AuthController["Auth Controller"]
        AIController["AI Component Controller"]
        ComponentController["Component Controller"]
        PaymentController["Payment Controller"]
    end

    DB[(MongoDB)]

    OpenRouter["OpenRouter API"]
    Firebase["Firebase"]
    Razorpay["Razorpay"]

    User --> UI

    UI --> AuthUI
    UI --> Generate
    UI --> Preview
    UI --> MyComponents
    UI --> AllComponents
    UI --> Pricing

    AuthUI --> Express
    Generate --> Express
    MyComponents --> Express
    AllComponents --> Express
    Pricing --> Express

    Express --> AuthController
    Express --> AIController
    Express --> ComponentController
    Express --> PaymentController

    AuthController --> Firebase
    AuthController --> DB

    AIController --> OpenRouter
    AIController --> DB

    ComponentController --> DB

    PaymentController --> Razorpay
    PaymentController --> DB
