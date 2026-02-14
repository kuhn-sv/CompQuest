# Projekt-Übergabedokumentation: CompQuest

Dieses Dokument beschreibt die Schritte zur Einrichtung, Entwicklung und Bereitstellung (Deployment) der CompQuest-Anwendung. Es werden drei Szenarien abgedeckt:
1.  Lokal (Entwicklung)
2.  Cloud-Deployment (Netlify & Supabase - Empfohlen)
3.  Alternatives Deployment (Ohne spezifische Cloud-Anbieter)

---

## Inhaltsverzeichnis

1. [Voraussetzungen](#1-voraussetzungen)
2. [Lokale Einrichtung (Local Setup)](#2-lokale-einrichtung-local-setup)
    - [2.1 Projektdateien entpacken](#21-projektdateien-entpacken)
    - [2.2 Umgebungsvariablen konfigurieren](#22-umgebungsvariablen-konfigurieren)
    - [2.3 Supabase (Datenbank) einrichten](#23-supabase-datenbank-einrichten)
    - [2.4 Anwendung starten](#24-anwendung-starten)
3. [Deployment mit Netlify & Supabase (Empfohlen)](#3-deployment-mit-netlify--supabase-empfohlen)
    - [3.1 Supabase Setup (Produktion)](#31-supabase-setup-produktion)
    - [3.2 Netlify Deployment](#32-netlify-deployment)
4. [Alternatives Deployment (Ohne Netlify / Ohne Supabase Cloud)](#4-alternatives-deployment-ohne-netlify--ohne-supabase-cloud)
    - [4.1 Frontend (Statische Seite)](#41-frontend-statische-seite)
    - [4.2 Backend ("Ask Tim" Funktion)](#42-backend-ask-tim-funktion---ersatz-für-netlify-functions)
    - [4.3 Datenbank ("Ohne Supabase Cloud")](#43-datenbank-ohne-supabase-cloud)

---

## 1. Voraussetzungen

Bevor Sie beginnen, stellen Sie sicher, dass folgende Software installiert ist:
*   **Node.js** (Version 18 oder neuer empfohlene LTS)
*   **Git**
*   **Code Editor** (z.B. VS Code)

Zusätzlich werden folgende Accounts/Schlüssel benötigt:
*   **Supabase Account** (für Datenbank & Auth)
*   **OpenAI API Key** (für den "Ask Tim" KI-Assistenten)

---

## 2. Lokale Einrichtung (Local Setup)

Führen Sie diese Schritte aus, um das Projekt auf Ihrem lokalen Rechner zu starten.

### 2.1 Projektdateien entpacken

1.  Entpacken Sie die ZIP-Datei in einen Ordner Ihrer Wahl.
2.  Öffnen Sie diesen Ordner in Ihrem Terminal/Eingabeaufforderung.
3.  Installieren Sie die Abhängigkeiten:

```bash
npm install
```

### 2.2 Umgebungsvariablen konfigurieren

Erstellen Sie eine Datei `.env.local` im Hauptverzeichnis. Nutzen Sie die folgende Vorlage (basierend auf `.env.local`):

```env
# Supabase Konfiguration (erhalten Sie nach Supabase Setup, siehe 2.3)
VITE_SUPABASE_URL=https://ihr-projekt.supabase.co
VITE_SUPABASE_ANON_KEY=ihr-anon-key

# App URLs (für lokal)
VITE_APP_URL=http://localhost:5173
VITE_AUTH_LOGIN_REDIRECT=http://localhost:5173/auth/login
VITE_AUTH_RESET_REDIRECT=http://localhost:5173/auth/reset

# Kurs Konfiguration
VITE_COURSE_NAME="Mein Kurs"
VITE_TIM_VERSION=0.3
TIM_MODEL="chatgpt-4o-latest" # Optional: Modell für Tim (Standard: chatgpt-4o-latest)

# OpenAI Key (Wird lokal via Netlify Dev oder Mock benötigt)
# ACHTUNG: Der Key wird eigentlich im Backend (Netlify Functions) genutzt.
# Für lokales Testen der Functions ist er hier nötig.
OPENAI_API_KEY=sk-...
```

### 2.3 Supabase (Datenbank) einrichten

Für die lokale Entwicklung empfiehlt es sich, ein Cloud-Development-Projekt bei Supabase zu erstellen (kostenlos).

1.  Erstellen Sie ein neues Projekt auf [supabase.com](https://supabase.com).
2.  Gehen Sie zum **SQL Editor** im Supabase Dashboard.
3.  Führen Sie die SQL-Skripte aus dem Ordner `supabase/sql/` in folgender Reihenfolge aus:
    1.  `001_profiles.sql` (Tabellen für User)
    2.  `002_exercise_stats.sql` (Statistiken)
    3.  `003_tim_messages.sql` (KI-Chat Historie)
    4.  `004_rpcs.sql` (Stored Procedures)
    5.  `005_views.sql` (Datenbank-Views)
    6.  `006_task_categories.sql` (Kategorien)
    7.  `007_professor_dashboard.sql` (Admin-Ansicht)
4.  Kopieren Sie die **Project URL** und den **anon public key** (unter Project Settings > API) in Ihre `.env.local`.

### 2.4 Anwendung starten

Starten Sie den Entwicklungsserver:

```bash
npm run dev
```

Die Anwendung ist nun unter `http://localhost:5173` erreichbar.

> **Hinweis zur KI-Funktion (Ask Tim):**
> Die "Ask Tim" Funktion nutzt Netlify Functions. Um diese lokal zu testen, verwenden Sie am besten das Netlify CLI:
> `npm install -g netlify-cli`
> `netlify dev` (statt `npm run dev`)

---

## 3. Deployment mit Netlify & Supabase (Empfohlen)

Dies ist der einfachste Weg, da das Projekt bereits für diese Stack konfiguriert ist (`netlify.toml`, `src/services/supabase`).

### 3.1 Supabase Setup (Produktion)
1.  Erstellen Sie ein neues **Produktions-Projekt** bei Supabase.
2.  Führen Sie die gleichen SQL-Skripte wie in Schritt 2.3 aus.
3.  Konfigurieren Sie unter **Authentication > URL Configuration**:
    *   Site URL: `https://ihre-netlify-app.netlify.app`
    *   Redirect URLs:
        *   `https://ihre-netlify-app.netlify.app/auth/login`
        *   `https://ihre-netlify-app.netlify.app/auth/reset`

### 3.2 Netlify Deployment

Sie haben zwei Möglichkeiten, das Projekt zu deployen:

**Option A: Via Git (Empfohlen)**
Der zuverlässigste Weg ist, den Code in ein eigenes Git-Repository (GitHub, GitLab, Bitbucket) zu laden.
1.  Erstellen Sie ein neues Repository bei einem Git-Anbieter.
2.  Initialisieren Sie Git im Projektordner und laden Sie den Code hoch:
    ```bash
    git init
    git add .
    git commit -m "Initial commit"
    git remote add origin <ihr-neues-repo-url>
    git push -u origin main
    ```
3.  Melden Sie sich bei [Netlify](https://www.netlify.com) an.
4.  Wählen Sie "Add new site" > "Import an existing project".
5.  Verbinden Sie Ihr Git-Repository.
6.  **Konfiguration:**
    *   Build command: `npm run build`
    *   Publish directory: `dist`

**Option B: Via Netlify CLI (Ohne Git-Repository)**
Wenn Sie kein Git-Repository erstellen möchten, können Sie das Netlify CLI nutzen.
1.  Installieren Sie das CLI: `npm install -g netlify-cli`
2.  Login: `netlify login`
3.  Deployment:
    ```bash
    npm run build
    netlify deploy --prod
    ```
    *   Wählen Sie "Create & configure a new site".
    *   Als "Publish directory" geben Sie `dist` an.

**Für beide Optionen - Environment Variables (WICHTIG):**
Fügen Sie in der Netlify-Oberfläche unter "Site configuration > Environment variables" alle Variablen aus Ihrer `.env.local` hinzu, angepasst an die Live-Umgebung:
*   `VITE_APP_URL`: Ihre Netlify URL (z.B. `https://mein-projekt.netlify.app`)
*   `VITE_AUTH_LOGIN_REDIRECT`: `.../auth/login`
*   `VITE_AUTH_RESET_REDIRECT`: `.../auth/reset`
*   `VITE_SUPABASE_URL`: URL des Produktions-Supabase-Projekts
*   `VITE_SUPABASE_ANON_KEY`: Key des Produktions-Supabase-Projekts
*   `OPENAI_API_KEY`: Ihr OpenAI Key (für die Netlify Function `ask-tim`)
*   `TIM_MODEL`: (Optional) Das zu verwendende OpenAI Modell (z.B. `chatgpt-4o-latest`, `gpt-3.5-turbo`). Standard: `chatgpt-4o-latest`.

Bei **Option A** klicken Sie auf **Deploy**. Netlify baut und deployt automatisch.
Bei **Option B** ist das Deployment nach dem Befehl `netlify deploy --prod` abgeschlossen.

---

## 4. Alternatives Deployment (Ohne Netlify / Ohne Supabase Cloud)

Sollten Sie auf Netlify oder die Supabase Cloud verzichten wollen, müssen Sie die Infrastruktur selbst bereitstellen.

### 4.1 Frontend (Statische Seite)
Das Frontend ist eine reine "Single Page Application" (SPA).

1.  Bauen Sie das Projekt:
    ```bash
    npm run build
    ```
2.  Der Ordner `dist/` enthält nun alle Dateien (HTML, CSS, JS).
3.  Laden Sie diesen Ordner auf einen beliebigen Webserver (Apache, Nginx, AWS S3, Vercel, Docker Nginx Container).
4.  **Wichtig:** Konfigurieren Sie den Server so, dass alle Anfragen auf `index.html` umgeleitet werden (SPA Routing), falls die Datei nicht existiert.

### 4.2 Backend ("Ask Tim" Funktion) - *Ersatz für Netlify Functions*
Die KI-Funktion (`src/features/ask-tim`) ruft `/api/ask-tim` auf, welches normalerweis eine Netlify Function ist. Ohne Netlify müssen Sie einen eigenen kleinen Server betreiben.

**Lösung: Eigener Express-Server**

Erstellen Sie eine Datei `server.js` (nicht im `dist` Ordner, sondern separat auf Ihrem Server):

```javascript
/* Einfacher Server für Ask-Tim API & Statische Dateien */
import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch'; // Ggf. 'npm install node-fetch' nötig, falls Node < 18
import path from 'path';
import { fileURLToPath } from 'url';
import * as dotenv from 'dotenv';
// Lokale JSON Daten importieren (Pfade müssen stimmen!)
import { createRequire } from "module"; 
const require = createRequire(import.meta.url);
const writeAssemblyTasks = require('./netlify/functions/data/write-assembly.json'); 
// ... (andere JSONs analog laden oder Handler-Code aus netlify/functions/ask-tim.ts anpassen)

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// API Endpunkt
app.post('/.netlify/functions/ask-tim', async (req, res) => {
    // Hier Logik aus netlify/functions/ask-tim.ts implementieren
    // Oder Anfragen an OpenAI weiterleiten
    // Wichtig: process.env.OPENAI_API_KEY nutzen
    
    // Vereinfachtes Beispiel:
    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
             method: 'POST',
             headers: {
                 'Content-Type': 'application/json',
                 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
             },
             body: JSON.stringify({
                 messages: req.body.messages, // Vereinfacht
                 model: process.env.TIM_MODEL || 'chatgpt-4o-latest'
             })
        });
        const data = await response.json();
        res.json(data);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Statische Dateien (Frontend) servieren
const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use(express.static(path.join(__dirname, 'dist')));

// SPA Fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => console.log(`Server läuft auf Port ${PORT}`));
```

### 4.3 Datenbank ("Ohne Supabase Cloud")

Wenn Sie Supabase **nicht** als Cloud-Dienst nutzen wollen, haben Sie zwei Optionen:

**Option A: Self-Hosted Supabase (Docker)**
Das ist die empfohlene Variante, wenn Sie "ohne Cloud" arbeiten wollen. Sie hosten den gesamten Supabase-Stack selbst.
1.  Folgen Sie der Anleitung: [Self-Hosting Supabase mit Docker](https://supabase.com/docs/guides/self-hosting/docker).
2.  Nach dem Start haben Sie lokale APIs.
3.  Setzen Sie in der `.env` (bzw. Umgebung) Ihrer App:
    `VITE_SUPABASE_URL=http://ihr-server:8000`
    `VITE_SUPABASE_ANON_KEY=ihr-selbst-generierter-key`

**Option B: Nur Postgres (Eingeschränkt)**
Wenn Sie *nur* eine PostgreSQL Datenbank nutzen (z.B. AWS RDS) und auf Supabase Auth/Realtime verzichten wollen, müsste die Anwendung umgeschrieben werden (`src/services/supabase` und Auth-Logic entfernen). **Dies wird nicht empfohlen**, da die Anwendung stark auf Supabase-Bibliotheken (`@supabase/supabase-js`) aufbaut.
