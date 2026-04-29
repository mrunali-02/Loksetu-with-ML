# Loksetu - AI-Powered NGO & Event Management Platform

Loksetu is a comprehensive, full-stack event and initiative management platform designed for NGOs and community organizations. Built on the **MERN Stack** (MongoDB, Express, React, Node.js) and supercharged by a **Python Machine Learning Microservice**, Loksetu streamlines volunteer coordination, attendance tracking, predictive analytics, and automated reporting.

## 🌟 Key Features

### 🧠 Machine Learning & AI Capabilities (Python Flask API)
- **Predictive Participation:** Uses Linear Regression trained on historical event data to forecast future event attendance based on category, volunteer capacity, and lead time.
- **AI Strategic Insights:** Automatically generates retention rates and provides tailored strategic recommendations (e.g., "Severe lack of volunteers", "Increase capacity limits") for completed and upcoming events.
- **Auto-Tagging & Classification:** Uses Zero-Shot NLP models to automatically classify events and initiatives into proper categories (Health, Education, Environment, etc.) based on their descriptions.
- **AI Chatbot Assistant:** A dedicated conversational agent built to assist users with event queries.

### 📊 Admin Analytics Dashboard
- **Real-Time KPIs:** Tracks total impact, global attendance rates, and retention statistics.
- **Visualizations:** Interactive charts built with `recharts` comparing registered vs. actual attended participants across different events.
- **Attendance Reconciling:** Fallback logic securely handles both explicit participant rosters and high-level historical data aggregation.

### 🌐 Modern Frontend Interface
- **Premium UI/UX:** Built with React, Framer Motion, and Lucide Icons. Follows a highly responsive "Modern Slate & Violet" and "Impact Green" design system.
- **Component Ecosystem:** Manage Events, Initiatives, Achievements, and Gallery with fully equipped CRUD functionality and file/image uploads.

---

## 🛠️ Technology Stack

**Frontend (Client)**
- React (Create React App)
- Material UI (MUI) & Custom CSS Design Tokens
- Recharts (Data Visualization)
- Framer Motion (Micro-animations)
- Lucide React & React Icons

**Backend (Node.js Server)**
- Node.js & Express
- MongoDB & Mongoose (Object Data Modeling)
- Multer (File Upload Handling)
- Axios (Inter-service communication with ML API)

**Machine Learning (Python Microservice)**
- Python 3.10+
- Flask (API Framework)
- Pandas & NumPy (Data Processing)
- Scikit-Learn (Linear Regression Models)
- HuggingFace Transformers (NLP Tagging)
- Google Generative AI (Chatbot integrations)

---

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### 1. Prerequisites
- **Node.js** (v18 or higher)
- **Python** (v3.10 or higher)
- **MongoDB** (Running locally on `mongodb://127.0.0.1:27017/` or configure a MongoDB Atlas URI)

### 2. Backend Setup (Node.js)
Navigate to the server directory and install dependencies:
```bash
cd server
npm install
```
Start the Node.js server (Runs on port 5000):
```bash
node index.js
```

### 3. ML Microservice Setup (Python)
Navigate to the ML API directory and install the required Python packages:
```bash
cd server/ml_api
pip install -r requirements.txt
```
*(Optional but recommended: Set up a virtual environment `python -m venv venv` before installing dependencies)*

Start the Flask server (Runs on port 8000):
```bash
python app.py
```

### 4. Frontend Setup (React)
Navigate to the client directory and install dependencies:
```bash
cd client/admin
npm install
```
Start the React development server (Runs on port 3000):
```bash
npm start
```

---

## 💾 Data Seeding (Historical ML Training Data)

To accurately test the machine learning predictions, the database needs historical events with calculated attendance data. A dedicated seeding script is provided.

Ensure your MongoDB instance is running, then execute:
```bash
cd server
node scripts/seed_predictions.js
```
*This will safely append 30 historical and upcoming events across various categories without overwriting your existing data, allowing the ML prediction model to calculate accurate category-based attendance retention metrics.*

---

## 📂 Project Structure

```text
Loksetu-with-ML/
├── client/
│   └── admin/               # React frontend applications
│       ├── public/          # Static assets
│       └── src/             # React components, pages, context, and styles
├── server/                  # Node.js Express backend
│   ├── controllers/         # Core business logic (Analytics, etc.)
│   ├── models/              # Mongoose schemas
│   ├── routes/              # Express API endpoints
│   ├── scripts/             # Data seeding scripts
│   ├── uploads/             # Locally stored Multer image uploads
│   └── ml_api/              # Python Machine Learning Microservice
│       ├── app.py           # Core ML Logic & Flask Server
│       └── requirements.txt # Python dependencies
└── README.md                # Project documentation
```

---

## 🤝 Contribution Guidelines
When contributing to this repository, please first discuss the change you wish to make via issue, email, or any other method with the owners of this repository before making a change. 

Ensure that your code adheres to the project's CSS variable design system and does not break the inter-service communication between the Node.js backend and the Python ML Microservice.
