# 🏦 Kudi — Enterprise-Grade Fintech Platform

A premium "agency-level" full-stack system redesign of the Kudi financial platform (formerly Bankly). This repository contains the complete Next.js Web App, React Native Mobile App, Express API, and Python Machine Learning components for the Kudi ecosystem.

> **Status:** Production-Ready API Architecture. 

## 🌐 Repository Architecture

Kudi operates on a microservice-inspired monorepo structure:

- `web/`: Next.js 14 App Router (Frontend Dashboard)
- `mobile/`: Expo / React Native App (iOS & Android)
- `backend/`: Node/Express.js & MongoDB (Live API System)
- `ai-backend/`: Python (AI Fraud Detection & Transaction Analysis)

## 🚀 Key Features

* **True Zero-Balance Architecture**: Say goodbye to demo data! All data is populated linearly from actual transactions submitted and tracked in the local MongoDB instance. Users authentically start with ₵0.00.
* **Fully Hooked REST API**: All modules (`Deposit`, `Withdraw`, `Transfer`, `Bills`, `Mobile Money`) POST to `localhost:5000/api`. 
* **Live Auth & Context**: JWT authenticated session workflows managed via `lib/api.ts` mapped uniformly across Web & Mobile apps using native Context wrappers.
* **Deep Mobile Money Integrations**: Dedicated modules for **MTN MoMo**, **Telecel**, and **AT Money**.
* **School Fees Hub**: Extended functionality supporting real-world integrations like the GCB-styled Institutional School Fees ledger.
* **AI Fraud Shield & Advisor**: Employs live GradientBoosting logic simulating real-world ML checks against the active ledger. Favourably handles empty dataset conditions and progressively trains on your localized activity list!
* **Balance Obfuscation Toggle**: Advanced security features built directly into your dashboard headers.

## 🛠️ Quick Start Guide

### 1. Backend (Node + MongoDB)
First, ensure you have MongoDB running locally (or adjust the URI in `.env`).
```bash
cd backend
npm install
npm run dev
```
*API runs on `http://localhost:5000`*

### 2. Web Dashboard (Next.js)
```bash
cd web
npm install
npm run dev
```
*Web client runs on `http://localhost:3000`*

### 3. Mobile App (Expo)
```bash
cd mobile
npm install
npx expo start
```
*Follow the terminal prompts to open the App via the Expo Go app on your physical device, or press `a` for Android Emulator.*

## 🔒 Security & Privacy

This codebase simulates banking-grade architectures locally. Your personal data entered into the application does not broadcast to external endpoints beyond your local network environment.
Please see the [Privacy Policy](web/app/privacy/page.tsx) and [Terms and Conditions](web/app/terms/page.tsx) for simulated regulatory guidelines framing Kudi.

---
*Built intricately with modern React, Framer Motion, and Tailwind CSS patterns to reflect pure Ghanaian aesthetics.*
