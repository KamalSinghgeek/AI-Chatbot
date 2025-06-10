# 🏡 Real Estate Chatbot (Full Stack Generative AI)

A full-stack web application simulating a **Generative AI-powered real estate chatbot** that filters properties based on user queries using **Function Calling** (mocked with demo responses).

---

## 📌 Features

* ✨ React + TailwindCSS responsive chat UI
* 🤖 Node.js + Express backend with OpenAI-style function calling (mocked)
* 🔍 Filter properties using natural language queries (e.g., “Show flats in Delhi under 60 lakhs”)
* 📝 Logs every interaction in `logs.json`
* ⚙️ Easily extendable to real OpenAI API or tools like n8n
* 🚀 Ready for local development or Render deployment

---

## 📂 Project Structure

```
real-estate-chatbot/
├── backend/
│   ├── index.js                # Express server setup and routes
│   ├── properties.js           # Hardcoded property data and filter logic
│   ├── logs.json               # Logs user queries and responses
│   ├── .env                    # Environment variables (e.g., OpenAI key)
│   └── package.json            # Backend dependencies
├── frontend/
│   ├── src/
│   │   ├── App.js              # Main chat UI component
│   │   ├── ChatMessage.js      # Reusable chat bubble component
│   │   ├── index.css           # TailwindCSS styles
│   │   └── main.jsx            # ReactDOM renderer
│   ├── tailwind.config.js      # TailwindCSS config
│   ├── postcss.config.js       # TailwindCSS/PostCSS integration
│   ├── index.html              # Base HTML file
│   └── package.json            # Frontend dependencies
└── README.md                   # Documentation
```

---

## 🧪 Sample Data

```json
[
  { "id": 1, "location": "Gurugram", "price": 4500000, "size": "1200 sqft", "type": "Apartment" },
  { "id": 2, "location": "Delhi", "price": 6000000, "size": "1500 sqft", "type": "Villa" },
  { "id": 3, "location": "Gurugram", "price": 3000000, "size": "900 sqft", "type": "Studio" },
  { "id": 4, "location": "Noida", "price": 5000000, "size": "1300 sqft", "type": "Apartment" },
  { "id": 5, "location": "Delhi", "price": 7000000, "size": "1800 sqft", "type": "Villa" }
]
```

---

## 🧠 How It Works (Architecture & Function Calling)

### 🏗️ Architecture

* **Frontend (React + Tailwind)**:

  * Chat UI with input box and scrollable message history
  * Sends user message to `/api/chat`
  * Displays response from backend

* **Backend (Node.js + Express)**:

  * `POST /api/chat`: Accepts query, simulates OpenAI function calling, and returns a mock response with property suggestions.
  * `GET /api/properties`: Returns the full hardcoded list of 5 properties.
  * Logs interactions in `logs.json`

### 🔁 Simulated Function Calling

Example:

```js
// When user says:
"Find apartments in Delhi under 60 lakhs"

// Function called:
filterProperties("Delhi", 6000000)
```

This returns filtered properties from the hardcoded array and sends them back in natural language format.

---

## 📋 API Reference

### `POST /api/chat`

Handles user query and returns filtered results.

* **Request body**:

```json
{
  "message": "Find properties in Gurugram under 50 lakhs"
}
```

* **Response (Mocked)**:

```json
{
  "response": "Found 2 properties in Gurugram under 5000000..."
}
```

---

### `GET /api/properties`

Returns full property list.

* **Response**:

```json
[
  { "id": 1, "location": "Gurugram", ... },
  ...
]
```

---

## ⚙️ Setup Instructions

### 🖥️ Prerequisites

* Node.js (v16+)
* npm or yarn

---

### 🧩 Environment Variables

Create a `.env` file in `/backend/` with:

```
OPENAI_API_KEY=your-api-key   # Not required if using mock responses
```

---

### 🔧 Local Development

#### 1. Start Backend

```bash
cd backend
npm install
npm run dev
```

#### 2. Start Frontend

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## 📊 Logs

All user queries and mock responses are appended to:

```
backend/logs.json
```

Structure:

```json
{
  "timestamp": "2025-06-10T08:00:00Z",
  "query": "Show apartments in Noida under 60 lakhs",
  "response": "Found 1 property in Noida under 60 lakhs..."
}
```

---

## 🔄 Extending with n8n (Optional Automation)

This project can be extended using **[n8n](https://n8n.io/)** to:

* Automate webhook triggers from user queries
* Log data to Google Sheets or Notion
* Send email notifications for new matching properties
* Integrate dynamic property sources or APIs

---

## 🚀 Deployment (Render)

Deploy backend and frontend separately on [Render](https://render.com/).

> ✅ Use `build` and `start` scripts in both package.json files
> ✅ Set environment variable `OPENAI_API_KEY` in Render dashboard (if using real API)

---

## 🛠️ Future Improvements

*  Use real OpenAI API for dynamic function calling
*  Connect to MongoDB/Postgres for real property data
*  Add unit tests (e.g., Jest, Supertest)
*  Mobile-first UI refinements
*  Authentication for agents/buyers

---

## 📄 Assumptions

* Using **mocked AI responses** due to API key limitations.
* Focused on functionality and architecture, not production-level polish.
* OpenAI function calling simulated via manual trigger logic in backend.

---

## 💼 Cover Note (Job Alignment)

This project demonstrates:

* ✅ End-to-end full-stack implementation (React + Node.js)
* ✅ Integration with Generative AI architecture
* ✅ Experience in prompt design, function simulation, and API structuring
* ✅ Focus on automation readiness (via logs & n8n)
* ✅ Clean, maintainable codebase with proper modularity and documentation

---
