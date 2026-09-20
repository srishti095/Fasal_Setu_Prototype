# Fasal Setu

## Smart Farmer Procurement & Queue Management Platform

**Smart India Hackathon 2026**  
**Problem Statement ID: 26032**

Fasal Setu is a farmer-focused digital procurement platform designed to simplify agricultural crop procurement, mandi centre discovery, date/time slot booking, live queue tracking, crop quality assessment, payment tracking, logistics coordination, and multilingual farmer assistance. Developed to address critical ground-level challenges faced by Indian farmers during crop harvesting seasons, Fasal Setu connects farmers, procurement centres, centre operators, transport operators, and administrators through a unified real-time system, providing a dignified and predictable procurement experience.

---

## 1. SIH Problem Statement

**Smart India Hackathon 2026 — Problem Statement ID: 26032**

During agricultural harvest seasons, government procurement centres (mandis) across India experience heavy congestion, unpredictable waiting times, and operational bottlenecks. Farmers often travel long distances with loaded trolleys without prior knowledge of queue lengths, daily center capacity, or operating schedules.

Key challenges addressed by Problem Statement 26032 include:
1. **Long Waiting Times**: Farmers waiting in unmanaged physical queues for hours or days at procurement centres.
2. **Lack of Procurement Schedule Visibility**: No centralized system for farmers to view available time slots or operating hours before leaving their farms.
3. **Uncertainty Regarding Procurement Status**: Lack of real-time visibility into token numbers, live queue movement, estimated wait times, and payment progress.
4. **Logistics & Coordination Difficulties**: Complexities in arranging timely transport (trolleys/tractors) synchronized with procurement slot times.

---

## 2. Project Objective

The main objectives of the Fasal Setu platform are to:
- **Simplify Farmer Procurement**: Transform chaotic physical arrival into a predictable, slot-based workflow.
- **Easier Centre Discovery**: Provide interactive map and list search for nearby active procurement centres.
- **Date & Time Slot Booking**: Allow farmers to choose available date and time windows before leaving home.
- **Live Queue & Wait Estimates**: Display real-time queue position counters and estimated wait times in minutes.
- **Crop Quality Assessment**: Assist farmers and operators with multi-angle AI image quality analysis for grain sample grading.
- **Transparent Payment Status**: Provide stage-by-stage visibility into procurement bills and settlement status.
- **Integrated Transport Coordination**: Connect farmers with approved local trolley transporters linked to booking times.
- **Multilingual Farmer Assistance**: Deliver conversational help through KETAN AI Assistant in Hindi, English, and Hinglish.
- **Provider-Independent IVR Architecture**: Establish a backend IVR state machine to support feature phone accessibility via future telephony integration.

---

## 3. Key Features

### 🌾 Farmer
- **Self-Registration & Authentication**: Mobile/email registration with OTP verification and JWT session security.
- **Farmer Dashboard**: Unified dashboard with live status alerts, upcoming slot KPI cards, payment tracking, and quick actions.
- **My Crops Management**: Register cultivated crop details (season, cultivated land area in acres, expected quantity in Tons, variety).
- **Procurement Centre Discovery**: Search active centres by state, district, crop, and status with interactive CARTO basemaps.
- **Procurement Slot Booking**: Select available dates and time slots with instant gate pass generation and gate pass reference IDs.
- **Multiple Bookings & Management**: View upcoming vs. past/completed slot history; support for booking multiple crops across slots.
- **Live Queue Tracking**: View live queue position, token number, estimated wait time in minutes, and status updates.
- **Payment Status Tracking**: Live payment records displaying total paid, pending amounts, payment mode (UPI/Net Banking/Cash/DEMO PFMS), and reference IDs.
- **KETAN AI Assistant**: Embedded conversational assistant for voice or text queries regarding slots, queues, and procurement guidance.
- **Multilingual UI**: Seamless language switching between English and Hindi.

### 🏛️ Admin
- **Executive Analytics Dashboard**: Platform-wide metrics for total registered farmers, active mandi centres, daily procurement throughput, payment totals, and open grievances.
- **Procurement Centre Management**: Add, update, pause, or view mandi capacity limits, slots, and geographical coordinates.
- **Operator & Transport Registration**: Create and manage Centre Operator and Transport Operator accounts with assigned centres.
- **Farmer Registry & Verification**: Inspect registered farmer profiles, land survey details, and bank account statuses.
- **Payment & Grievance Oversight**: Monitor financial disbursement pipelines and resolve farmer grievance tickets.
- **System Audit Logs**: Track administrative and operator actions with timestamps for security compliance.

### 🏢 Procurement Operator
- **Assigned Centre Console**: Operational view of assigned mandi yard, capacity utilization, active queue tokens, and centre status controls (`ACTIVE`, `PAUSED`, `FULL_CAPACITY`).
- **Farmer Check-In & Token Issuance**: Verify farmer gate passes (or scan QR code) to issue sequential queue tokens (`WAITING`, `CHECKED_IN`).
- **Live Queue Controls**: Call next farmer token, complete token, or record no-shows.
- **Multi-Photo AI Quality Assessment**: Execute 5-photo computer vision grain defect analysis (discoloration, foreign matter, broken grain proxies) generating an official grade certificate (`FAQ`, `Grade A`, `Grade B`, `Below Grade`).
- **Physical Quality & Weighment Entry**: Record moisture levels, physical inspection observations, and gross/tare/net scale weighments in kilograms and Tons.
- **Bill Confirmation & Payment Initiation**: Confirm accepted quantity, calculate final payment amount, and initiate payment settlement.

### 🚚 Logistics / Transport Operator
- **Transporter Profile**: Manage vehicle details (Tractor Trolley / Truck), load capacity in Tons, trip fares, and service areas.
- **Trolley Booking Management**: Receive, inspect, accept (`ACCEPTED`), or decline farmer transport requests.
- **Transport Workflow Tracking**: Update trip status lifecycle:
  $$\text{REQUESTED} \longrightarrow \text{ACCEPTED} \longrightarrow \text{DRIVER\_EN\_ROUTE} \longrightarrow \text{PICKED\_UP} \longrightarrow \text{IN\_TRANSIT} \longrightarrow \text{COMPLETED}$$
- **Linked Booking Info**: Access farmer contact, pickup location, crop tonnage, and destination mandi.

### 🤖 AI Integration
- **KETAN AI Assistant**: Server-side Google Gemini API integration (`gemini-2.5-flash`) providing natural language answers for procurement questions.
- **Python FastAPI Grain Microservice**: Dedicated computer vision microservice (`python_service/app.py`) analyzing multi-image grain samples.
- **Server-Side Fallback Engine**: If the Python microservice or Gemini API is temporarily offline, Node backend gracefully provides local canvas quality scoring and fallback answers.

### ⚡ Real-Time Capabilities
- **Socket.IO Integration**: Integrated WebSocket server sharing the Node HTTP port.
- **Live Events**: Real-time broadcasts for live queue position updates (`queueUpdate`), payment disbursements (`paymentUpdated`), and in-app alerts (`notification`).

### ☎️ IVR Backend Module Architecture
- **Provider-Independent Engine**: Configured with IVR state flags (`IVR_ENABLED`, `IVR_SESSION_TIMEOUT` in `server/src/config/env.js`) to support future feature-phone access.
- **Telephony Integration Status**: Provider-independent backend design; production telephony carrier integration (e.g., Exotel, Twilio) and carrier webhook endpoints remain pending integration.

---

## 4. User Roles

| Role | Responsibility | Access Control |
| :--- | :--- | :--- |
| **Farmer** | Registers crops, searches centres, books procurement slots, tracks live queue, books transport, monitors payments, asks KETAN. | Protected (`role('FARMER')`) |
| **Admin** | Manages mandi centres, registers operators & transporters, monitors platform payments, inspects audit logs & grievances. | Protected (`role('ADMIN')`) |
| **Procurement Operator** | Manages assigned mandi centre operations, performs farmer gate check-in, runs AI grain quality checks, records weighments, initiates payments. | Protected (`role('OPERATOR')`) |
| **Logistics Operator** | Manages vehicle profile & fare, accepts farmer trolley requests, updates transport pickup & delivery status. | Protected (`role('LOGISTICS')`) |

---

## 5. System Architecture

```text
                               +---------------------------------------+
                               |     Browser Client (Farmers / Staff)  |
                               |    (Vanilla HTML5 / CSS3 / ES Modules)|
                               +-------------------+-------------------+
                                                   |
                                                   | HTTP / WebSocket
                                                   v
                               +-------------------+-------------------+
                               |       Node.js / Express Backend       |
                               |          (Port 5000 / $PORT)          |
                               +---------+-----------------+-----------+
                                         |                 |
                +------------------------+                 +-------------------------+
                |                                                                    |
                v                                                                    v
+---------------+---------------------+                               +--------------+--------------------+
|         MongoDB Atlas               |                               |    Python FastAPI AI Service       |
|    (Mongoose Schemas & Models)      |                               |  (Port 8000 / $PYTHON_SERVICE_URL) |
+-------------------------------------+                               +-----------------------------------+
                |                                                                    |
                v                                                                    v
+---------------+---------------------+                               +--------------+--------------------+
|       Socket.IO Server              |                               |        Google Gemini API          |
|  (Live Queue & Payment Updates)     |                               |   (KETAN AI Conversational Model) |
+-------------------------------------+                               +-----------------------------------+
```

*Note: Express serves the static frontend from `client/` as well as all REST API endpoints under `/api/` on the same server.*

---

## 6. Tech Stack

### Frontend
- **HTML5 & CSS3**: Custom responsive styling system with CSS variable themes.
- **JavaScript (ES Modules)**: Native browser ES Modules without heavyweight build tools.
- **Interactive Maps**: Leaflet.js with CARTO Voyager tile basemaps.

### Backend
- **Node.js & Express.js**: Asynchronous REST API framework.
- **Mongoose ORM**: Schema definition and document object modeling.
- **Socket.IO**: Real-time event broadcasting.
- **JWT & Bcrypt.js**: Token-based authentication and password hashing.

### Database
- **MongoDB**: Primary document database. Supports local MongoDB (`mongodb://127.0.0.1:27017/fasalSetu`) for development and MongoDB Atlas for cloud deployment via `MONGO_URI`.

### AI & Microservices
- **Python 3 & FastAPI**: Computer vision multi-image grain analysis microservice (`Pillow`/`PIL` matrix inspection).
- **Google Gemini API**: Conversational AI model (`gemini-2.5-flash`) for KETAN assistant.

---

## 7. Project Structure

```text
fasalSetu3/
├── .env.example                     # Environment template blueprint
├── .gitignore                        # Git ignore patterns
├── README.md                        # Project documentation
├── client/                          # Frontend web application
│   ├── assets/                      # Static assets & crop slides
│   ├── index.html                   # Public portal landing page
│   ├── farmer-dashboard.html        # Farmer portal
│   ├── admin-dashboard.html         # Admin portal
│   ├── operator-dashboard.html      # Procurement Operator portal
│   ├── logistics-dashboard.html     # Transport Operator portal
│   ├── app.js                       # Core auth & API client logic
│   ├── dashboard.js                 # Dashboard controllers & rendering
│   ├── ketan.js                     # KETAN AI UI & Web Speech engine
│   ├── ketan-knowledge.js           # KETAN offline knowledge base
│   └── styles.css                   # Global UI design system
├── docs/                            # Documentation guides
│   ├── ARCHITECTURE.md              # System architecture details
│   └── SIH-DEMO.md                  # Demonstration guide
├── python_service/                  # Python FastAPI AI Quality Microservice
│   ├── app.py                       # FastAPI application & CV grading pipeline
│   └── requirements.txt             # Python package dependencies
└── server/                          # Node.js Express API Backend
    ├── package.json                 # Server dependencies & scripts
    ├── package-lock.json
    ├── .env.example
    └── src/
        ├── app.js                   # Express application setup
        ├── server.js                # Server entry point & Socket.IO listener
        ├── config/                  # Database & env config (`db.js`, `env.js`)
        ├── controllers/             # Controller business logic (`api.js`)
        ├── middleware/              # Auth & Role middleware (`auth.js`)
        ├── models/                  # Mongoose models (`models.js`)
        ├── routes/                  # Express API router (`index.js`)
        ├── seed/                    # Database seeding script (`seed.js`)
        ├── services/                # Business services (`auth.js`, `notifications.js`)
        └── utils/                   # Helpers (`auth.js`, `capture.js`)
```

---

## 8. Environment Variables

All sensitive configuration parameters are managed via environment variables.

| Variable Name | Purpose | Default / Example Placeholder |
| :--- | :--- | :--- |
| `PORT` | Node.js Express server port | `5000` (Render dynamically assigns this) |
| `MONGO_URI` | MongoDB connection string (Local or MongoDB Atlas) | `mongodb://127.0.0.1:27017/fasalSetu` |
| `JWT_SECRET` | Secret key for signing JWT session tokens | `your_jwt_secret_here` |
| `CLIENT_URL` | Allowed origin for CORS verification | `*` |
| `OTP_MODE` | OTP delivery mode (`DEMO` or `LIVE`) | `DEMO` |
| `GEMINI_API_KEY` | Google Gemini API key for KETAN assistant | `your_gemini_api_key_here` |
| `GEMINI_MODEL` | Gemini model name | `gemini-2.5-flash` |
| `PYTHON_SERVICE_URL` | Microservice URL for AI Grain Quality Check | `http://localhost:8000` |
| `IVR_ENABLED` | Toggle flag for IVR endpoints | `true` |
| `IVR_SESSION_TIMEOUT` | IVR session expiration timeout in seconds | `1800` |

*Note: Secrets must be stored in local `.env` files or cloud platform environment settings and must NEVER be committed to GitHub.*

---

## 9. Local Development Setup

### Prerequisites
- **Node.js** (v18.0.0 or higher) & **npm**
- **Python** (v3.9 or higher)
- **MongoDB** (Local MongoDB Community Server running on `27017` OR a MongoDB Atlas database URI)
- **Git**

### Installation & Execution Steps

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/fasalSetu3.git
   cd fasalSetu3
   ```

2. **Configure environment variables**:
   Create a `.env` file inside `server/` using `.env.example` as a template:
   ```bash
   cp server/.env.example server/.env
   ```
   *(Edit `server/.env` to add your optional `GEMINI_API_KEY` or custom `MONGO_URI`)*

3. **Install Node backend dependencies & seed demo database**:
   ```bash
   cd server
   npm install
   node src/seed/seed.js
   ```

4. **Install Python AI service dependencies (Optional)**:
   ```bash
   cd ../python_service
   pip install -r requirements.txt
   ```

5. **Start Python AI microservice**:
   ```bash
   python app.py
   # Microservice will start on http://localhost:8000
   ```

6. **Start Node backend server**:
   ```bash
   cd ../server
   npm start
   # Server will start on http://localhost:5000
   ```

7. **Open Application in Browser**:
   Navigate to:
   ```text
   http://localhost:5000/index.html
   ```

#### Demo Testing Accounts
- **Farmer**: `9876543210` / `Farmer@123`
- **Procurement Operator**: `operator@fasalsetu.demo` / `Operator@123`
- **Transport Operator**: `logistics@fasalsetu.demo` / `Logistics@123`
- **Admin**: `admin@fasalsetu.demo` / `Admin@123`

---

## 10. MongoDB Atlas Integration

Fasal Setu is designed to work seamlessly with **MongoDB Atlas** for cloud deployment:
- Provide your MongoDB Atlas connection string in the `MONGO_URI` environment variable (e.g. `mongodb+srv://<username>:<password>@cluster.mongodb.net/fasalSetu?retryWrites=true&w=majority`).
- If `MONGO_URI` is not provided, the application safely falls back to local MongoDB (`mongodb://127.0.0.1:27017/fasalSetu`) for offline local development.

---

## 11. AI Grain Quality Check

Fasal Setu implements an automated grain quality analysis pipeline for crop grading:

```text
Farmer/Operator uploads at least 5 crop sample photos
              │
              v
Node.js Express Backend (/api/farmer/crops/:id/quality-check or /api/public/quality-check-ai)
              │
              v
Python FastAPI Microservice (http://localhost:8000/analyze-json)
              │
              v
Computer Vision RGB Matrix & Edge Analysis (Discoloration, Foreign Matter, Broken Grain Proxies via PIL)
              │
              v
Quality Certificate Result (FAQ / Grade A / Grade B / Below Grade, Composite Score & Observations)
              │
              v
Rendered on Dashboard & Saved to MongoDB
```

### Current Prototype
- **Microservice Integration**: Python FastAPI service (`python_service/app.py`) parses base64 crop sample images.
- **Multi-Angle Image Requirement**: Requires at least 5 crop sample photos from distinct angles to calculate composite quality metrics.
- **PIL Image Processing**: Computes discoloration proxy (RGB saturation/warmth), foreign matter proxy (dark pixel density), and broken grain proxy (edge sharpness matrix).
- **Graceful Fallback**: If the Python microservice is offline, the Node backend provides a local evaluation algorithm so operations are never blocked.

### Future Production
- Deep Learning computer vision model (CNN / Vision Transformer / PyTorch) trained on certified FCI & State Mandi crop sample datasets.

---

## 12. KETAN AI Assistant

**KETAN** is the dedicated AI assistant for farmers:
- **Server Proxy Architecture**: Powered by the Google Gemini API via backend request proxying (`POST /api/public/ask`), ensuring `GEMINI_API_KEY` remains secret on the server.
- **Configurable Model**: Reads model name from `GEMINI_MODEL` (defaults to `gemini-3.6-flash` / `gemini-2.5-flash`) with automatic fallbacks to `gemini-1.5-flash` and `gemini-2.0-flash`.
- **Multilingual Support**: Responds in simple English, Hindi (Devanagari script), or Hinglish (Roman Hindi script) based on user preference.
- **Context-Aware Assistance**: Directs answers based on current section context (slot booking, live queue, payments, MSP calculator, transport).
- **Client Fallback**: Features an offline knowledge base (`client/ketan-knowledge.js`) as a fallback if network connection or API limits are reached.

---

## 13. IVR Backend Architecture

Fasal Setu includes a **provider-independent IVR backend architecture**:

### Architecture & Configuration
- **State Machine Flags**: Controlled via environment flags (`IVR_ENABLED`, `IVR_SESSION_TIMEOUT` in `server/src/config/env.js`).
- **Provider Independence**: Backend logic and state handling are decoupled from specific telephony providers.
- **Telephony Integration Status**: Provider-independent backend design; production telephony carrier integration (e.g., Exotel, Twilio) and carrier webhooks are pending production integration.

---

## 14. Real-Time Features

Socket.IO WebSockets provide real-time updates across the platform:
- **Live Queue Tracking**: Updates farmer queue position counters and estimated wait times dynamically.
- **Payment Status Updates**: Pushes real-time alerts when procurement payments are processed.
- **Dashboard Notifications**: Delivers in-app system notifications to online farmers and operators.
- **Unified Server**: Socket.IO shares the main Node HTTP server (`Port 5000`), simplifying deployment.

---

## 15. Planned Cloud Deployment Architecture

The intended cloud deployment architecture for hosting Fasal Setu on Render and MongoDB Atlas:

```text
                               ┌─────────────────────────┐
                               │     GitHub Repository   │
                               └────────────┬────────────┘
                                            │
                                            v
                               ┌─────────────────────────┐
                               │   Render Web Service    │
                               │  (Node.js / Express)    │
                               └──────┬───────────┬──────┘
                                      │           │
                 ┌────────────────────┘           └────────────────────┐
                 ▼                                                     ▼
┌─────────────────────────────────┐                   ┌─────────────────────────────────┐
│       MongoDB Atlas             │                   │    Render Web Service / Docker  │
│  (Database Cluster - MONGO_URI) │                   │    (Python FastAPI Microservice)│
└─────────────────────────────────┘                   └─────────────────────────────────┘
```

---

## 16. GitHub & Deployment Workflow

Recommended workflow for updating and deploying the repository:

```text
Local Development & Testing
           │
           v
Run syntax check (`node --check`)
           │
           v
Stage production files (`git add .`)
           │
           v
Commit changes (`git commit -m "..."`)
           │
           v
Push to GitHub (`git push origin main`)
           │
           v
Automatic Deployment on Render (via Webhooks)
```

*Security Reminder*: Never commit `.env` files or API secrets to GitHub. Always set configuration keys in Render's Environment Settings dashboard.

---

## 17. Current Prototype Limitations

- **Free Cloud Services**: Hosting on free tier cloud providers may cause initial request delays (cold starts) when services wake up after inactivity.
- **Telephony Provider**: The IVR architecture provides environment configuration and state handling (`IVR_ENABLED`, `IVR_SESSION_TIMEOUT`); live carrier phone integration requires configuring a telephony gateway webhook (e.g. Exotel, Twilio).
- **AI Quality Assessment**: The computer vision grading is a prototype visual quality estimate and should not replace certified laboratory testing in formal commercial disputes.
- **OTP Verification**: Configured in `DEMO` mode for testing convenience; SMS gateway credentials can be attached for live production delivery.

---

## License

Developed for **Smart India Hackathon 2026** under **Problem Statement ID: 26032**.  
*Fasal Setu is a student hackathon demonstration prototype.*
