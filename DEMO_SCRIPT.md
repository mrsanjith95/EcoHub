# EcoHub — 3-Minute Hackathon Demo Script

> **WeMakeDevs Environmental Hacks 2026 Submission Video Script**  
> *Target Duration: Exactly 2 minutes 50 seconds (Under 3 minutes limit)*

---

## 🎬 Video Script & Action Timeline

### ⏱️ 0:00 – 0:20 | Introduction & Problem Statement
- **Visual**: Show EcoHub Landing Page (`/`). Scroll through Problem vs Solution cards.
- **Voiceover**: 
  > *"Every year, millions of tons of recyclable waste are collected and transported long distances without considering where materials can be processed locally. This causes unnecessary transport emissions and landfill waste. Welcome to EcoHub — a local waste processing and collection network built for WeMakeDevs Environmental Hacks 2026."*

---

### ⏱️ 0:20 – 0:45 | Waste Generator Flow
- **Visual**: Click "Sign In" $\rightarrow$ Click "Generator Demo" button $\rightarrow$ Click "+ Report Waste" $\rightarrow$ Select `Organic` waste $\rightarrow$ Enter `25 kg` $\rightarrow$ Click "Use My Location".
- **Voiceover**: 
  > *"As a waste generator, reporting waste takes seconds. We select the waste category, enter the estimated mass in kilograms, provide our pickup address, and upload a photo proof."*

---

### ⏱️ 0:45 – 1:10 | Automatic Hub Matching Algorithm
- **Visual**: Click "Submit Waste Report". Show success card displaying matched hub: `GreenCycle Organic Composting Center (DEMO)` at `0 km distance`.
- **Voiceover**: 
  > *"Upon submission, EcoHub’s automatic hub matching algorithm instantly evaluates nearby processing facilities using the Haversine formula, matching our report with the closest active hub that accepts organic waste and has available capacity."*

---

### 1:10 – 1:35 | Collector Pickup Workflow
- **Visual**: Sign out $\rightarrow$ Login as `Collector Demo` (`collector@ecohub.demo`) $\rightarrow$ Show Collector Operations Dashboard (`/collector-dashboard`) $\rightarrow$ Click "Accept Pickup" $\rightarrow$ Click "Mark Collected" $\rightarrow$ Click "Mark Delivered".
- **Voiceover**: 
  > *"Next, the local waste collector accesses their dispatch dashboard, accepts the open pickup job, collects the waste from the generator, and delivers the shipment directly to the designated processing hub. Every transition is logged in a status timeline."*

---

### ⏱️ 1:35 – 2:00 | Processing Hub Outcome Logging
- **Visual**: Sign out $\rightarrow$ Login as `Hub Operator` (`hub@ecohub.demo`) $\rightarrow$ Open Processing Hub Portal (`/hub-dashboard`) $\rightarrow$ Click "Process Waste" on delivered shipment $\rightarrow$ Set processing method to `Composted` $\rightarrow$ Enter `25 kg` composted & diverted $\rightarrow$ Click "Complete Waste Processing".
- **Voiceover**: 
  > *"At the processing facility, the hub operator inspects the delivered shipment, selects the processing method — such as Composting or Recycling — logs the outcome quantities, and records the exact mass diverted from landfill."*

---

### ⏱️ 2:00 – 2:25 | Dynamic Impact Dashboard
- **Visual**: Click "Impact" in Navbar $\rightarrow$ Open Impact Dashboard (`/impact`). Show metric cards & Recharts Bar/Pie charts updating dynamically.
- **Voiceover**: 
  > *"All processing records automatically feed into our Impact Dashboard. EcoHub displays verifiable data calculated directly from database records — including total waste collected, processed, composted, and diverted from landfills."*

---

### ⏱️ 2:25 – 2:45 | System Administration Portal
- **Visual**: Sign out $\rightarrow$ Login as `Admin Demo` (`admin@ecohub.demo`) $\rightarrow$ Open Admin Dashboard (`/admin-dashboard`). Show user role distribution and active hubs directory.
- **Voiceover**: 
  > *"Administrators have a bird's-eye view of the entire network — auditing registered user distribution across generators, collectors, and hubs, and monitoring facility capacity."*

---

### ⏱️ 2:45 – 3:00 | AWS Architecture & Closing
- **Visual**: Show AWS S3 configuration diagram / architecture slide. Show GitHub repository README.
- **Voiceover**: 
  > *"EcoHub currently uses Amazon S3 for waste-report image storage. The application can be deployed to AWS separately. Built with React, Vite, Express, and MongoDB, EcoHub turns waste management into a transparent, localized circular network. Thank you!"*
