# LLM Evaluation Dashboard

A full-stack web application built to compare, benchmark, and analyze completions from multiple Large Language Models (LLMs) simultaneously. The system sends prompt queries in parallel to selected models, collects results, evaluates responses using an automated AI judge (with detailed rationales), and visualizes overall stats, cost, latency, and average ratings in an interactive dashboard.

## Tech Stack
- **Frontend:** React.js, Vite, Tailwind CSS, Recharts (Charts/Analytics), Lucide-react (Icons)
- **Backend:** Node.js, Express.js (ES Modules), Mongoose (MongoDB ORM)
- **Database:** MongoDB
- **Integrations:** Groq API (Llama 3.1 8B, Llama 3.3 70B, Llama 4 Scout, Qwen 3 32B)

---

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB running locally (default port: `27017`)

### Installation & Configuration

1. **Clone/Place the Project Files** in your active directory.

2. **Configure Backend Settings**
   Create/update the backend configuration at `backend/.env`:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/llm-eval-db
   JWT_SECRET=llm-eval-secret-key-2026

   # AI Provider API Keys (Optional: if empty, Mock Mode will activate automatically)
   GROQ_API_KEY=your-groq-api-key
   ```
   *Note: If API keys are left blank, the platform launches in a high-fidelity **Mock Mode**, simulating completions and judge grading without running up API costs!*

3. **Install Dependencies**
   - **Backend:**
     ```bash
     cd backend
     npm install
     ```
   - **Frontend:**
     ```bash
     cd ../frontend
     npm install
     ```

### Running the Application

To run the application locally, start both the backend and frontend dev servers:

1. **Start MongoDB (if not running)**
   Ensure your local MongoDB service is active.

2. **Start Backend Server:**
   ```bash
   cd backend
   npm run dev
   ```
   The backend service starts at `http://localhost:5000`.

3. **Start Frontend Server:**
   ```bash
   cd ../frontend
   npm run dev
   ```
   The Vite dev server starts at `http://localhost:5173`. Open this URL in your browser to view the dashboard!

---

## Core Application Pages
1. **Dashboard:** High-level metrics showing total evaluations, average overall scores, cumulative token usage, and API cost breakdowns. Interative line charts, bar charts, and cell pie charts from Recharts.
2. **Playground:** A prompt playground showing side-by-side completions for chosen models in real-time. View latency, costs, token consumption, and detailed AI-judge reviews. Save prompts as presets.
3. **Leaderboard:** Dynamic model standings ranked by aggregated overall ratings. Displays custom gold/silver/bronze rankings.
4. **History:** Log of all past evaluations. Drill down into specific rows to inspect previous side-by-side completions and judge feedback, or rerun queries back in the playground.
5. **Test Cases:** Preset list of standard prompt benchmarks. Add, edit, remove, or run them with a single click.
6. **Settings:** Review system environment variables, local database statuses, and active token pricing charts.
