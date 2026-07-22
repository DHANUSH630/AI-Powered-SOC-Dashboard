# Software Requirements Specification (SRS)
## Project Name: SentinelAI – Enterprise AI-Powered SOC Dashboard
**Document Version:** 1.0.0  
**Date:** July 2026  
**Status:** Approved  
**Project Lead:** SentinelAI Core Architecture Team  

---

## 1. Executive Summary & Project Overview

### 1.1 Project Overview
**SentinelAI** is an enterprise-grade, AI-powered Security Operations Center (SOC) Dashboard designed to unify log collection, automated threat detection, machine learning anomaly detection, interactive threat intelligence enrichment, and real-time incident management into a cohesive security management platform.

Modern Security Operations Centers face significant operational challenges: log volume overload, high false-positive rates, alert fatigue, fragmented tools, and delayed mean time to detect (MTTD) and mean time to respond (MTTR). SentinelAI addresses these challenges by embedding machine learning models (Isolation Forest, Random Forest, XGBoost, Decision Trees, Logistic Regression) alongside a deterministic rule-based threat engine to analyze multi-source logs, automatically map threats to the MITRE ATT&CK framework, assign standardized CVSS scores, and deliver real-time actionable intelligence through WebSockets and intuitive visualizations.

### 1.2 System Scope
SentinelAI encompasses end-to-end security event processing:
* **Multi-Source Log Ingestion:** Support for Windows Event Logs, Linux Syslogs, Apache/Nginx web server logs, Firewall events, Suricata IDS alerts, Zeek network security monitoring logs, and custom JSON payloads.
* **Hybrid Threat Detection Engine:** Deterministic rule matching combined with supervised and unsupervised machine learning models for zero-day and anomalous activity detection.
* **AI Threat Analysis:** Automated contextual enrichment mapping detections to MITRE ATT&CK techniques, generating CVSS v3.1 scores, and offering remediation guidance.
* **Real-Time Monitoring & WebSockets:** Low-latency push updates for live events, alert counters, and system metrics.
* **Incident Lifecycle Management:** Workflow automation for alert escalation, analyst assignment, evidence collection, interactive event timelines, and resolution reporting.
* **Threat Intelligence Integration:** Synchronous and asynchronous querying of VirusTotal, AbuseIPDB, Shodan, CVE databases, and MaxMind GeoIP.
* **Enterprise Reporting & Notifications:** Exportable PDF/CSV/JSON reports, scheduled executive summaries, and multi-channel alerting (Email, Slack, Discord, Desktop).

### 1.3 Strategic Objectives
* **Reduce MTTD by 60%:** Automate initial log parsing, normalization, and threat correlation.
* **Reduce Alert Fatigue by 75%:** Utilize ML scoring and threat confidence algorithms to prioritize high-fidelity alerts.
* **Provide 10,000+ EPS Throughput:** Ensure scalable ingestion and sub-200ms API response times under standard enterprise operational loads.
* **Standardize Response Workflows:** Map 100% of detected alerts to MITRE ATT&CK tactics and provide automated playbook recommendations.

---

## 2. Functional Requirements by Module

### 2.1 Authentication & Role-Based Access Control (RBAC) Module
* **FR-AUTH-01 (User Registration & Onboarding):** The system shall allow Administrators to register new users with email validation and enforced initial password resets.
* **FR-AUTH-02 (Secure Login & Token Issuance):** The system shall authenticate users using email and password credentials, returning short-lived JSON Web Tokens (JWT access tokens, 15-minute validity) and securely stored HTTP-only refresh tokens (7-day validity).
* **FR-AUTH-03 (Password Security):** The system shall hash all user passwords using `bcrypt` (or `Argon2id`) with a configurable work factor prior to storage in MongoDB.
* **FR-AUTH-04 (Role-Based Access Control):** The system shall enforce granular permissions based on three primary roles: `Admin`, `Security Analyst`, and `Viewer`.
* **FR-AUTH-05 (Session & Refresh Management):** The system shall support explicit token revocation (logout) and silent access token renewal using refresh tokens via Redis blacklisting.
* **FR-AUTH-06 (Password Recovery):** The system shall provide a secure "Forgot Password" workflow generating time-bound, cryptographically signed reset tokens sent via email.
* **FR-AUTH-07 (Audit Logging of Auth Events):** The system shall log all authentication attempts (successful login, failed login, token refresh, password reset) to an immutable audit collection.

### 2.2 Log Collection & Processing Module
* **FR-LOG-01 (Multi-Source Parsing):** The system shall ingest and parse unstructured, semi-structured, and structured log streams from:
  - Windows Event Logs (EVTX/XML converted to JSON)
  - Linux Syslog (RFC 3164 / RFC 5424)
  - Apache HTTP Server Access & Error logs (Combined/Common format)
  - Nginx Access & Error logs
  - Firewall logs (Palo Alto, Cisco ASA, iptables)
  - Suricata IDS EVE JSON logs
  - Zeek NSM logs (conn, http, dns, ssh)
  - Custom JSON log payloads
* **FR-LOG-02 (Schema Normalization):** The system shall normalize all ingested logs into a unified Common Event Format (CEF/ECS equivalent), extracting mandatory fields: `timestamp`, `hostname`, `service`, `source_ip`, `destination_ip`, `source_port`, `destination_port`, `log_type`, `severity`, and `raw_message`.
* **FR-LOG-03 (Batch & Stream Ingestion):** The system shall accept log files via HTTP POST multipart form data uploads and real-time log streams via WebSocket / REST endpoints.
* **FR-LOG-04 (Deduplication & Sanitization):** The system shall sanitize input strings against injection attacks and deduplicate identical log events occurring within a configurable sliding time window (e.g., 5 seconds).
* **FR-LOG-05 (Querying & Filtering):** The system shall provide full-text search, regex filter, date-range filter, severity filter, and log-type filter capabilities with pagination.

### 2.3 Threat Detection Engine
* **FR-DET-01 (Deterministic Rule Engine):** The system shall evaluate incoming normalized logs against predefined and custom security rules for:
  - **Brute Force Detections:** > N failed login attempts within T seconds from a single IP/User.
  - **Port Scanning:** Connection attempts to > N distinct ports within T seconds.
  - **SQL Injection (SQLi):** Pattern match for classic payload signatures (`UNION SELECT`, `' OR '1'='1`, `exec xp_cmdshell`).
  - **Cross-Site Scripting (XSS):** Pattern match for script injection tags (`<script>`, `javascript:`, `onload=`).
  - **Malware Activity:** Known malicious file hash execution or suspicious process ancestry.
  - **Directory Traversal:** Execution of `../` sequences in web requests.
  - **Reverse Shell Activity:** Spawning of shell processes (`/bin/sh`, `powershell.exe`) over non-standard network ports.
  - **Command Injection:** Arbitrary OS command execution indicators (`|`, `;`, `&&`).
  - **Suspicious PowerShell Execution:** Encoded command flags (`-EncodedCommand`, `-enc`, bypass flags).
* **FR-DET-02 (Machine Learning Anomaly Detection Engine):** The system shall run incoming feature vectors through pre-trained ML models:
  - **Isolation Forest:** Unsupervised anomaly scoring for unusual traffic volume or parameter distributions.
  - **Random Forest & XGBoost:** Supervised classification for complex multi-stage attack patterns.
  - **Decision Tree & Logistic Regression:** Fast baseline classification models.
* **FR-DET-03 (Confidence Score Calculation):** The system shall calculate a aggregate confidence score (0.0 to 1.0 / 0% to 100%) for each detected threat based on rule weights and ML probability scores.
* **FR-DET-04 (Alert Generation):** When a rule or ML model threshold is crossed, the system shall automatically create an `Alert` record with severity levels: `Critical`, `High`, `Medium`, or `Low`.

### 2.4 AI Threat Analysis & Contextual Enrichment
* **FR-AI-01 (MITRE ATT&CK Mapping):** The system shall map detected threats to MITRE ATT&CK Tactics (e.g., Initial Access, Execution, Persistence, Privilege Escalation) and Techniques (e.g., T1110 for Brute Force, T1190 for Exploit Public-Facing Application).
* **FR-AI-02 (CVSS v3.1 Scoring):** The system shall compute dynamic Common Vulnerability Scoring System (CVSS) vectors and numerical scores based on attack metrics (Exploitability, Impact, Attack Vector).
* **FR-AI-03 (Actionable Remediation Guidance):** The system shall automatically generate contextual analyst playbooks and recommended response steps (e.g., "Block IP 192.168.1.50 on firewall", "Force password reset for compromised user").

### 2.5 Real-Time Monitoring & WebSockets
* **FR-RT-01 (Persistent WebSocket Connection):** The system shall maintain authenticated WSS (WebSocket Secure) connections with connected frontend clients.
* **FR-RT-02 (Live Log & Alert Streaming):** The system shall broadcast normalized live log events and newly triggered alerts to connected dashboard clients in sub-50ms latency.
* **FR-RT-03 (Real-Time Counter & Metrics Updates):** The system shall push live metric updates (Total Logs, Critical Alert Count, Open Incidents, Active Blocked IPs, System Risk Score).

### 2.6 Incident Lifecycle Management
* **FR-INC-01 (Incident Creation & Escalation):** The system shall allow analysts to escalate single or multiple related alerts into a formal `Incident` with assigned incident numbers (e.g., `INC-2026-0042`).
* **FR-INC-02 (Analyst Assignment & Priority):** The system shall allow assigning incidents to specific Analysts with priority designations (`P1 - Critical`, `P2 - High`, `P3 - Medium`, `P4 - Low`).
* **FR-INC-03 (Interactive Incident Timeline):** The system shall maintain an immutable chronological timeline recording system events, manual analyst notes, status updates, and artifact attachments.
* **FR-INC-04 (Evidence Vault):** The system shall allow analysts to attach log snippets, file hashes, PCAP files, and analyst notes as verifiable evidence to an incident.
* **FR-INC-05 (Status Workflow & Resolution):** The system shall support state transitions (`Open` → `In Progress` → `Mitigated` → `Closed`) requiring mandatory resolution notes before closure.

### 2.7 Threat Intelligence Integrations
* **FR-TI-01 (IP Reputation Lookup):** The system shall query VirusTotal and AbuseIPDB APIs for source/destination IP malicious confidence scores, ISP info, and domain associations.
* **FR-TI-02 (Domain & Hash Lookup):** The system shall query VirusTotal and CVE databases for suspicious domain registrations and file hash (MD5, SHA-256) malware detections.
* **FR-TI-03 (Shodan Reconnaissance Data):** The system shall query Shodan API for open ports, banner information, running services, and known vulnerabilities on target IPs.
* **FR-TI-04 (GeoIP Mapping):** The system shall resolve IP addresses to geographical coordinates, country, city, and Autonomous System Numbers (ASN).
* **FR-TI-05 (TI Caching):** The system shall cache external API threat intelligence responses in Redis for 24 hours to stay within rate limits and optimize latency.

### 2.8 Dashboard & Data Visualization
* **FR-DASH-01 (Executive Metric Cards):** The dashboard shall display live counters for Total Logs Ingested, Critical Alerts, Open Incidents, Blocked IPs, Average Threat Score, and Overall Risk Score.
* **FR-DASH-02 (Attack Timeline Chart):** Interactive time-series chart showing attack frequency, categorized by severity over 24-hour, 7-day, and 30-day windows.
* **FR-DASH-03 (Threat & Severity Distribution):** Donut and pie charts breaking down alerts by attack type (Brute Force, SQLi, XSS, Anomaly) and severity level.
* **FR-DASH-04 (Geographical Attack Map):** World map visualization pinpointing attack origin locations based on GeoIP data.
* **FR-DASH-05 (Top Attacking IPs & Target Ports):** Ranked lists of top offending source IPs and targeted service ports.

### 2.9 Notification & Alerting System
* **FR-NOTIF-01 (Multi-Channel Notifications):** The system shall send instant notifications via Email (SMTP), Desktop Browser Notifications (Web Notification API), Slack Webhooks, and Discord Webhooks upon triggering Critical or High severity alerts.
* **FR-NOTIF-02 (User Notification Preferences):** Users shall be able to configure notification thresholds and channel enable/disable toggles in their personal settings.

### 2.10 Reporting & Analytics Module
* **FR-REP-01 (Export Formats):** The system shall support generating reports in PDF, CSV, and JSON formats.
* **FR-REP-02 (Report Types):** The system shall support Executive Summary Reports, Incident Summary Reports, Threat Intelligence Briefings, and Audit Trail logs.
* **FR-REP-03 (Scheduled Reporting):** The system shall support automated weekly and monthly report generation sent directly to configured email distribution lists.

---

## 3. Non-Functional Requirements (NFRs)

### 3.1 Performance Requirements
* **NFR-PERF-01 (API Latency):** 95% of standard REST API requests shall respond in under 200 milliseconds under normal operating load.
* **NFR-PERF-02 (Log Ingestion Rate):** The log ingestion engine shall process and normalize up to 10,000 events per second (EPS) per Uvicorn worker instance.
* **NFR-PERF-03 (Real-Time WebSocket Delay):** Delay between log ingestion and WebSocket alert rendering on connected clients shall be less than 50 milliseconds.
* **NFR-PERF-04 (Database Query Optimization):** All queries on `Logs` and `Alerts` collections must utilize indexes, executing in < 50ms for ranges under 100,000 records.

### 3.2 Security Requirements
* **NFR-SEC-01 (Transport Encryption):** All communication between clients, servers, and external services must be encrypted using TLS 1.3 (HTTPS / WSS).
* **NFR-SEC-02 (Data at Rest Encryption):** Sensitive credentials, database volumes, and threat intelligence API keys must be encrypted using AES-256.
* **NFR-SEC-03 (Input Validation & Sanitization):** All incoming API payloads and log fields must be strictly validated using Pydantic models to prevent SQLi, XSS, and Command Injection.
* **NFR-SEC-04 (Rate Limiting):** Public endpoints (Login, Password Reset, Log Ingestion) must enforce rate limits (e.g., max 10 login attempts/min, 100 log upload requests/min) via Redis token bucket.
* **NFR-SEC-05 (Security Headers & CORS):** FastAPI backend must inject standard security headers (`HSTS`, `X-Frame-Options`, `X-Content-Type-Options`, `Content-Security-Policy`) and restrict CORS origins to authorized frontend domains.

### 3.3 Scalability & Architectural Resilience
* **NFR-SCALE-01 (Horizontal Backend Scaling):** FastAPI/Uvicorn backend instances must be stateless, supporting horizontal scaling behind an Nginx load balancer.
* **NFR-SCALE-02 (Asynchronous Queueing):** Redis must be utilized as an asynchronous event queue and Pub/Sub broker to decouple log ingestion from heavy ML inference tasks.
* **NFR-SCALE-03 (Database Scalability):** MongoDB Atlas setup must support automatic sharding on `timestamp` and `log_type` for high storage capacity.

### 3.4 Availability & Reliability
* **NFR-AVAIL-01 (System Uptime):** The platform shall maintain a operational availability of 99.9% uptime (excluding scheduled maintenance windows).
* **NFR-AVAIL-02 (Fault Isolation):** Failure in an external Threat Intelligence API (e.g., VirusTotal offline) must not degrade primary log ingestion or rule detection operations.
* **NFR-AVAIL-03 (Graceful Degradation):** Under extreme log bursts (>15,000 EPS), the engine shall prioritize rule-based detection over computationally intensive ML inference to prevent buffer overflows.

### 3.5 Usability & Accessibility
* **NFR-USE-01 (Responsive Design):** Frontend dashboard must be responsive across desktop monitors (1920x1080), laptops (1366x768), and tablets (1024x768).
* **NFR-USE-02 (Dark Mode Theme):** Dashboard UI shall use an enterprise dark SOC theme tailored for low-light monitoring environments.

---

## 4. User Roles & Permissions Matrix

| Feature / Action | Admin | Security Analyst | Viewer |
| :--- | :---: | :---: | :---: |
| **View Dashboard Metrics & Charts** | ✅ | ✅ | ✅ |
| **View Logs & Apply Filters** | ✅ | ✅ | ✅ |
| **View Alerts & Threat Intelligence** | ✅ | ✅ | ✅ |
| **Manually Upload Log Files** | ✅ | ✅ | ❌ |
| **Acknowledge & Update Alert Status** | ✅ | ✅ | ❌ |
| **Create & Edit Incidents** | ✅ | ✅ | ❌ |
| **Assign Incidents to Analysts** | ✅ | ✅ | ❌ |
| **Upload Incident Evidence Files** | ✅ | ✅ | ❌ |
| **Resolve & Close Incidents** | ✅ | ✅ | ❌ |
| **Export Reports (PDF, CSV, JSON)** | ✅ | ✅ | ✅ |
| **Manage Users & Role Assignments** | ✅ | ❌ | ❌ |
| **Configure System Integration Keys** | ✅ | ❌ | ❌ |
| **View & Export System Audit Logs** | ✅ | ❌ | ❌ |
| **Configure Alert Rules & Thresholds** | ✅ | ❌ | ❌ |

---

## 5. System Constraints & Assumptions

### 5.1 Technical & Environmental Constraints
* **Language & Runtimes:** Backend built on Python 3.10+; Frontend built on Node.js 18+ / React 18.
* **Database System:** MongoDB 6.0+ required for time-series optimization and secondary indexing.
* **Cache & Message Broker:** Redis 7.0+ required for Pub/Sub messaging and token caching.
* **API Rate Limits:** Free-tier external API keys (VirusTotal, AbuseIPDB, Shodan) impose strict requests-per-minute limits; robust caching is mandatory.
* **Storage Limits:** Log retention is subject to available disk capacity; historical raw logs purged after 90 days by default.

### 5.2 Assumptions
* Network time synchronization (NTP) is active across all client hosts submitting logs to maintain timestamp precision.
* Log senders transmit timestamps compliant with ISO 8601 or RFC 3164 standards.
* Security Analysts have basic familiarity with MITRE ATT&CK terminology and CVSS scoring frameworks.

---

## 6. Detailed Use Case Specifications

### 6.1 Use Case UC-01: Log Ingestion & Real-Time Anomaly Detection
* **Primary Actor:** Log Collector / External Agent / Analyst
* **Preconditions:** SentinelAI backend services, Redis broker, and ML models are active.
* **Main Flow:**
  1. External agent or analyst submits log batch via REST API or syslog daemon.
  2. Log Collector receives request, validates schema using Pydantic, and sanitizes payload.
  3. Log is normalized into Common Event Format and pushed to Redis Pub/Sub queue.
  4. Threat Detection Engine pops log, runs Rule Engine checks (e.g., SQLi pattern match).
  5. Machine Learning Engine extracts features and computes anomaly score via Isolation Forest.
  6. If anomaly score > threshold, AI Engine generates Threat Alert with MITRE ATT&CK mapping (`T1190`) and CVSS score (`8.5`).
  7. Alert is saved to MongoDB `Alerts` collection.
  8. WebSocket Server pushes new alert event to active frontend sessions.
  9. Frontend dashboard updates alert counters and renders real-time toast notification.
* **Alternative Flow (Normal Log):**
  - If no rule triggers and ML score is below threshold, log is saved to `Logs` collection; no alert is generated.
* **Postconditions:** Log is stored; alert created and rendered on live dashboard.

---

### 6.2 Use Case UC-02: Escalating Alert to Incident & Assigning Analyst
* **Primary Actor:** Security Analyst
* **Preconditions:** User is logged in with `Security Analyst` or `Admin` role; unresolved alerts exist.
* **Main Flow:**
  1. Analyst navigates to Alerts table and filters by `Critical` severity.
  2. Analyst inspects AI analysis breakdown and threat intelligence reputation data.
  3. Analyst selects "Escalate to Incident".
  4. System prompts for Incident Title, Description, and Assigned Analyst.
  5. Analyst selects candidate analyst and sets priority to `P1 - Critical`.
  6. System creates new entry in `Incidents` collection (e.g., `INC-2026-0104`), links alert ID, and appends initial timeline entry.
  7. System sends notification email/Slack message to the assigned analyst.
  8. Alert status is updated from `New` to `Investigating`.
* **Postconditions:** Incident is created, tracked, and assigned for investigation.

---

### 6.3 Use Case UC-03: Threat Intelligence Enrichment
* **Primary Actor:** Security Analyst / Automated System
* **Preconditions:** External API credentials (VirusTotal, AbuseIPDB, Shodan) are configured.
* **Main Flow:**
  1. An alert contains unknown public source IP `185.220.101.5`.
  2. System checks Redis cache for `ti:ip:185.220.101.5`.
  3. If cache miss, system fires parallel HTTP requests to VirusTotal, AbuseIPDB, Shodan, and GeoIP provider.
  4. Services return reputation score (AbuseIPDB 100% malicious), open ports (Shodan: 80, 443, 9001 - Tor exit node), and geolocation (Germany).
  5. System consolidates response, caches result in Redis for 24 hours (TTL: 86400s), and returns payload to frontend.
  6. Frontend displays threat card with GeoIP map marker and risk badge.
* **Postconditions:** External intelligence enriched and cached.

---

### 6.4 Use Case UC-04: Automated Response & Incident Resolution
* **Primary Actor:** Security Analyst
* **Preconditions:** Analyst has completed remediation steps for an open incident.
* **Main Flow:**
  1. Analyst selects active incident `INC-2026-0104`.
  2. Analyst uploads evidence file `pcap_analysis.pcap` and enters resolution notes: "Source IP blocked at perimeter firewall. Affected endpoint isolated and re-imaged."
  3. Analyst changes incident status to `Resolved`.
  4. System calculates Mean Time to Respond (MTTR), updates incident record with timestamp, and marks linked alerts as `Resolved`.
  5. Audit log entry recorded for closure action.
* **Postconditions:** Incident is closed, evidence stored, metrics updated.
