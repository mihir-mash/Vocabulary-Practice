# 🎓 GRE AI Vocab - Smart Vocabulary Flashcards

A modern, responsive web application for mastering GRE vocabulary using AI-generated insights and a priority-weighted learning system. Fully cloud-synced across mobile and desktop with passwordless account management via Firebase.

---

## ✨ Key Features
- **AI-Powered Word Insights:** Powered by **Groq API** to instantly generate GRE-specific definitions, contextual example sentences, synonyms, and antonyms.
- **Priority-Weighted Revision Engine:** Built-in flashcard engine with **Hard / Medium / Easy** rating buttons that prioritize difficult words in practice rounds.
- **Cloud Sync & Passwordless Accounts:** Real-time multi-device sync via **Firebase Firestore**. Enter any username (e.g., `mihir`) to isolate your personal word list without needing passwords.
- **Local-to-Cloud Migration:** Built-in 1-click sync utility to push existing offline words stored in `LocalStorage` up to the Firestore cloud.
- **Mobile-First Responsive Design:** Clean 3D card flip animations powered by **Framer Motion**, optimized for both mobile touchscreens and desktop screens.
- **Environment & Local Key Support:** Flexible API key configuration via `.env` environment variables or browser LocalStorage.

---

## 🛠️ Tech Stack
- **Frontend Framework:** React (Vite)
- **Styling:** Vanilla CSS & Tailwind CSS
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **AI Engine:** Groq API (`openai/gpt-oss-20b`)
- **Database:** Firebase Firestore (NoSQL)
- **Hosting:** Netlify

---

## 🚀 Getting Started Locally

### Prerequisites
- Node.js (v18 or higher)
- npm

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/mihir-mash/Vocabulary-Practice.git
   cd Vocabulary-Practice
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and add your Groq API Key:
   ```env
   VITE_GROQ_API_KEY=your_groq_api_key_here
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

---

## ☁️ Database Setup (Firebase Firestore)
The application connects to Firebase Firestore using `src/firebase.js`.
Words are stored under the following Firestore document hierarchy:
```
users/{username}/words/{wordId}
```

---

## 📦 Deployment on Netlify
1. Connect your GitHub repository to Netlify.
2. Configure build settings:
   - **Build Command:** `npm run build`
   - **Publish Directory:** `dist`
3. Set environment variable in Netlify Site Settings:
   - `VITE_GROQ_API_KEY`: Your Groq API key
