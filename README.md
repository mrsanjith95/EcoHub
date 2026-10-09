# EcoHub — Local Waste Processing & Collection Network

> **WeMakeDevs Environmental Hacks 2026 Hackathon Project**  
> *Track: Waste & Energy*

EcoHub is an environmental platform connecting local waste generators directly with specialized waste collection services and nearby recycling/processing hubs. By intelligently routing waste streams to nearby hubs based on category capabilities and capacity, EcoHub reduces unnecessary waste transport emissions, improves waste segregation, and maximizes landfill diversion.

---

## 🎯 The Problem

Urban and regional waste is frequently collected and transported long distances without considering where specific waste streams (Organic, Plastic, E-Waste, Glass, Metal) can be processed efficiently. This results in:
- Excessive vehicle emissions and transport costs.
- Improper waste segregation leading to contaminated recyclables.
- High volumes of recoverable materials being dumped into landfills.

---

## 🌱 The Solution

EcoHub provides an end-to-end digital network for local waste recovery:
1. **Waste Generators** report waste category, weight (kg), pickup address, and photo proof.
2. **Automatic Hub Matcher** calculates Haversine geographical distances to match the report with the nearest active processing hub accepting that category.
3. **Waste Collectors** view open pickup jobs, accept dispatches, and log collection & hub delivery.
4. **Processing Hubs** receive incoming shipments and record actual output quantities (**Recycled**, **Composted**, **Recovered**, or **Sent for further treatment**).
5. **Impact Dashboard** aggregates real database records to display verifiable landfill diversion statistics.

---

## 👥 Core User Roles

| Role | Capabilities | Demo Credentials |
| :--- | :--- | :--- |
| **Waste Generator** | Report waste, auto-match hubs, view pickup requests & status timeline | `generator@ecohub.demo` / `password123` |
| **Waste Collector** | Access pickup queue, accept jobs, mark as `Collected` & `Delivered` | `collector@ecohub.demo` / `password123` |
| **Processing Hub** | Access hub portal (`/hub-dashboard`), accept shipments, record processing outcomes | `hub@ecohub.demo` / `password123` |
| **Administrator** | System-wide overview (`/admin-dashboard`), user role distribution & hub auditing | `admin@ecohub.demo` / `password123` |

---

## 💻 Tech Stack

- **Frontend**: React 18, Vite (v5.4.11), React Router DOM (v7), Lucide React Icons, Recharts (Dynamic Impact Charts), Vanilla CSS Design System (Green/White visual identity).
- **Backend**: Node.js, Express.js REST API, JWT Authentication (`jsonwebtoken`), Bcrypt password hashing (`bcryptjs`), Multer file handling.
- **Database**: MongoDB with Mongoose ODM (includes zero-config in-memory fallback for instant dev execution).
- **AWS Integration**: Amazon S3 integration via `@aws-sdk/client-s3` for waste photo proof storage.

---

## ☁️ Real AWS S3 Integration

EcoHub actively uses **Amazon S3** for waste report image storage:
- **Region**: `ap-south-1`
- **Bucket**: `ecohub-waste-images-2026-sanjith`
- **SDK**: Configured using `@aws-sdk/client-s3` and `@aws-sdk/s3-request-presigner`.
- **Upload Flow**: When a generator uploads a waste photo proof, the Express API uses Multer memory storage and streams the buffer to Amazon S3. The generated S3 object URL (`https://ecohub-waste-images-2026-sanjith.s3.ap-south-1.amazonaws.com/waste-reports/{reportId}/{timestamp}-{filename}`) is saved in `WasteReport.imageUrl`.
- **Security**: AWS credentials (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`) are loaded exclusively from `server/.env`. `.env` is listed in `.gitignore` and is **NEVER** committed to GitHub or exposed in frontend code/API responses.
- **Optional Upload & Fallback**: Image upload is optional. Reports submitted without an image function seamlessly. If AWS environment variables are absent, fallback image URLs are used without breaking report creation.

EcoHub currently uses Amazon S3 for waste-report image storage. The application can be deployed to AWS separately.

---

## 🏗️ System Architecture & Workflow

```text
[ Generator ] ---> Reports Waste (Category, kg, Location, S3 Photo)
                       │
                       ▼
        [ Haversine Auto-Match Algorithm ]
                       │
                       ▼
[ Collector ] ---> Accepts Job ---> Marks Collected ---> Marks Delivered
                                                            │
                                                            ▼
[ Hub Operator ] ---> Receives Shipment ---> Records Processing (Recycled/Composted)
                                                            │
                                                            ▼
                                           [ Real Impact Dashboard Stats ]
```

---

## 🚀 Local Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)

### 1. Clone & Setup Backend (`server/`)
```bash
cd server
npm install
```

Create `server/.env` file:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/ecohub
JWT_SECRET=ecohub_super_secret_hackathon_key_2026

# Amazon S3 Configuration
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_S3_BUCKET_NAME=ecohub-waste-images-2026-sanjith
```

Run Backend Server:
```bash
npm run dev
```
*(Backend runs at `http://localhost:5000`. Seed data and demo accounts auto-initialize).*

### 2. Setup Frontend (`client/`)
```bash
cd client
npm install
```

Create `client/.env` file:
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

Run Frontend Development Server:
```bash
npm run dev
```
*(Frontend runs at `http://localhost:5173`).*

---

## 📡 API Overview

- **Auth**: `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- **Waste Reports**: `POST /api/waste/reports` (supports multipart image upload to S3), `GET /api/waste/reports`, `GET /api/waste/reports/:id`, `PATCH /api/waste/reports/:id/status`
- **Processing Hubs**: `GET /api/hubs`, `GET /api/hubs/nearby`, `GET /api/hubs/:id`, `GET /api/hubs/:id/incoming`, `POST /api/hubs/:id/process`
- **Collector**: `GET /api/collector/jobs`
- **Impact Stats**: `GET /api/impact/stats`
- **Admin**: `GET /api/admin/overview`

---

## 📊 Environmental Impact Methodology

EcoHub strictly computes landfill diversion statistics from **actual database records** created when processing hubs log processed shipments.
- **Landfill Diverted Mass (kg)** = Sum of verified recycled, composted, and recovered quantities.
- **No Unverifiable Assumptions**: EcoHub deliberately avoids unverified CO2 claims or unsupported multipliers. All statistics shown on the `/impact` dashboard reflect real, traceable waste mass diverted from landfills.

---

## ⚠️ Known Limitations

- Real-time geolocation relies on standard browser HTML5 Geolocation API (`navigator.geolocation`).
- Mobile push notifications and WebSockets were excluded to prioritize a working, rock-solid REST MVP.

---

## 🤖 AI Tool Disclosure

This project was developed with assistance from AI coding tools (Antigravity AI Assistant by Google DeepMind) during the WeMakeDevs Environmental Hacks 2026 hackathon for code generation, architecture planning, and debugging. All environmental impact statistics and application workflows are driven by application database logic.

---

*EcoHub — Building a Cleaner, Sustainable Future.*
