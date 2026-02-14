# CompQuest - Gamified Computer Science Learning Platform

**CompQuest** ist eine interaktive Lernplattform, die Studierenden der "Start Informatik"-Module spielerisch Konzepte der Technischen Informatik vermittelt.

## 🚀 Features

*   **Interaktive Missionen**:
    *   **Zahlensysteme**: Umrechnung zwischen Binär, Dezimal und Hexadezimal.
    *   **Logikgatter**: Visualisierung und Verständnis digitaler Schaltungen.
    *   **Von-Neumann-Architektur**: Interaktiver Aufbau und Verständnis der CPU-Komponenten.
*   **KI-Assistent**: Ein integrierter Chatbot (basiert auf OpenAI), der als virtueller Tutor fungiert und kontextbezogene Hilfestellung gibt.
*   **Fortschrittssystem**: Gamification-Elemente wie Badges und Levels, gespeichert via Supabase.
*   **Professor-Dashboard**: Übersicht über den Lernfortschritt der Studierenden.

## 🛠 Tech Stack

*   **Frontend**: React (v19), TypeScript, Vite
*   **Styling**: SCSS (Sass), Vanilla CSS
*   **Backend / Datenbank**: Supabase (PostgreSQL, Auth, Realtime)
*   **Serverless Functions**: Netlify Functions (für OpenAI Proxy)
*   **KI**: OpenAI API (Standard: chatgpt-4o-latest, konfigurierbar via `TIM_MODEL`)

## 📦 Installation & Deployment

Eine detaillierte Anleitung zur **lokalen Einrichtung** und zum **Deployment** (Netlify & Supabase sowie Alternativen) finden Sie in der Übergabedokumentation:

👉 **[HANDOVER_DOC.md](./HANDOVER_DOC.md)**

Bitte lesen Sie dieses Dokument sorgfältig durch, bevor Sie das Projekt aufsetzen.

## 📝 Lizenz

Dieses Projekt wurde für akademische Zwecke entwickelt.
