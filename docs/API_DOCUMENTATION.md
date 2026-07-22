# REST API & WebSocket Documentation
## Project Name: SentinelAI – Enterprise AI-Powered SOC Dashboard
**Document Version:** 1.0.0  
**Date:** July 2026  
**Status:** Approved  
**Base URL:** `https://api.sentinelai.io/api/v1`  
**WebSocket URL:** `wss://api.sentinelai.io/ws/v1/stream`  

---

## 1. Architecture Overview & Standards

### 1.1 Base URL & API Versioning
All RESTful API routes are prefixed with `/api/v1`. Minor non-breaking updates preserve the `/v1` prefix, while breaking protocol changes increment the version (e.g., `/v2`).

### 1.2 Authentication & Authorization
SentinelAI enforces **JSON Web Token (JWT)** authentication. Clients obtain access tokens via the `/auth/login` endpoint and must supply them in the HTTP `Authorization` header for all protected endpoints:

```http
Authorization: Bearer <JWT_ACCESS_TOKEN>
```

#### User Role Hierarchy:
* `Admin`: Full read, write, delete, and configuration access across all modules.
* `Security Analyst`: Read and write access to logs, alerts, incidents, threat intelligence, and reports. Cannot modify user accounts or system keys.
* `Viewer`: Read-only access to dashboard charts, alerts, incidents, and reports.

### 1.3 Standard JSON Response Envelope
All API responses return a predictable JSON payload envelope:

```json
{
  "status": "success",
  "data": { ... },
  "message": "Operation completed successfully.",
  "timestamp": "2026-07-22T18:30:00Z"
}
```

#### Standard Error Response Envelope:
```json
{
  "status": "error",
  "error": {
    "code": "UNAUTHORIZED_ACCESS",
    "message": "Invalid or expired JWT access token.",
    "details": null
  },
  "timestamp": "2026-07-22T18:30:00Z"
}
```

### 1.4 HTTP Status Codes

| Code | Status Name | Description |
| :--- | :--- | :--- |
| `200 OK` | Success | Request succeeded and data returned. |
| `201 Created` | Created | Resource successfully created. |
| `400 Bad Request` | Bad Request | Validation error or invalid payload structure. |
| `401 Unauthorized` | Unauthorized | Missing or expired authentication token. |
| `403 Forbidden` | Forbidden | Insufficient permissions for user role. |
| `404 Not Found` | Not Found | Target resource does not exist. |
| `429 Too Many Requests`| Rate Limited | Exceeded API rate limits (Token bucket exhausted). |
| `500 Internal Error` | Server Error | Internal failure; exception captured in logs. |

---

## 2. Authentication Endpoints

### 2.1 Register User
* **Method:** `POST`
* **Path:** `/api/v1/auth/register`
* **Access Level:** `Admin` Only

#### Request Body Parameters:
| Parameter | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `name` | `string` | Yes | Full name of the user |
| `email` | `string` | Yes | Valid email address |
| `password` | `string` | Yes | Strong password (Min 8 chars, 1 upper, 1 number, 1 symbol) |
| `role` | `string` | Yes | Role: `Admin`, `Security Analyst`, `Viewer` |

#### Example Request:
```json
POST /api/v1/auth/register
Content-Type: application/json

{
  "name": "Sarah Connor",
  "email": "sarah.connor@sentinelai.io",
  "password": "SecurePassword123!",
  "role": "Security Analyst"
}
```

#### Example Response (`201 Created`):
```json
{
  "status": "success",
  "data": {
    "id": "669e4f1a2b3c4d5e6f7a8b9c",
    "name": "Sarah Connor",
    "email": "sarah.connor@sentinelai.io",
    "role": "Security Analyst",
    "created_at": "2026-07-22T18:30:00Z"
  },
  "message": "User registered successfully.",
  "timestamp": "2026-07-22T18:30:00Z"
}
```

---

### 2.2 User Login
* **Method:** `POST`
* **Path:** `/api/v1/auth/login`
* **Access Level:** Public

#### Request Body Parameters:
| Parameter | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `email` | `string` | Yes | Registered email address |
| `password` | `string` | Yes | User password |

#### Example Request:
```json
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "sarah.connor@sentinelai.io",
  "password": "SecurePassword123!"
}
```

#### Example Response (`200 OK`):
```json
{
  "status": "success",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "d9f8e7d6c5b4a3...",
    "token_type": "Bearer",
    "expires_in": 900,
    "user": {
      "id": "669e4f1a2b3c4d5e6f7a8b9c",
      "name": "Sarah Connor",
      "email": "sarah.connor@sentinelai.io",
      "role": "Security Analyst"
    }
  },
  "message": "Authentication successful.",
  "timestamp": "2026-07-22T18:30:00Z"
}
```

---

### 2.3 Refresh Token
* **Method:** `POST`
* **Path:** `/api/v1/auth/refresh`
* **Access Level:** Public (Requires valid Refresh Token)

#### Request Body Parameters:
| Parameter | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `refresh_token` | `string` | Yes | Valid refresh token string |

#### Example Response (`200 OK`):
```json
{
  "status": "success",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.new_token...",
    "token_type": "Bearer",
    "expires_in": 900
  },
  "message": "Access token refreshed.",
  "timestamp": "2026-07-22T18:30:00Z"
}
```

---

### 2.4 User Logout
* **Method:** `POST`
* **Path:** `/api/v1/auth/logout`
* **Access Level:** Authenticated Users

#### Example Response (`200 OK`):
```json
{
  "status": "success",
  "data": null,
  "message": "User logged out successfully. Token blacklisted.",
  "timestamp": "2026-07-22T18:30:00Z"
}
```

---

### 2.5 Forgot Password & Reset Password
* **Method:** `POST`
* **Path:** `/api/v1/auth/forgot-password` and `/api/v1/auth/reset-password`
* **Access Level:** Public

#### Example Request (`forgot-password`):
```json
POST /api/v1/auth/forgot-password
{
  "email": "sarah.connor@sentinelai.io"
}
```

#### Example Response (`200 OK`):
```json
{
  "status": "success",
  "data": null,
  "message": "Password reset instructions sent to registered email.",
  "timestamp": "2026-07-22T18:30:00Z"
}
```

---

## 3. User Management Endpoints

### 3.1 List Users
* **Method:** `GET`
* **Path:** `/api/v1/users`
* **Access Level:** `Admin` Only

#### Query Parameters:
| Parameter | Type | Required | Default | Description |
| :--- | :--- | :---: | :--- | :--- |
| `page` | `integer` | No | `1` | Page number |
| `limit` | `integer` | No | `20` | Items per page |
| `role` | `string` | No | `null` | Filter by role |

#### Example Response (`200 OK`):
```json
{
  "status": "success",
  "data": {
    "users": [
      {
        "id": "669e4f1a2b3c4d5e6f7a8b9c",
        "name": "Sarah Connor",
        "email": "sarah.connor@sentinelai.io",
        "role": "Security Analyst",
        "is_active": true,
        "last_login": "2026-07-22T14:30:00Z"
      }
    ],
    "pagination": { "total": 1, "page": 1, "pages": 1 }
  },
  "message": "Users fetched successfully.",
  "timestamp": "2026-07-22T18:30:00Z"
}
```

---

### 3.2 Update User Role
* **Method:** `PATCH`
* **Path:** `/api/v1/users/{id}/role`
* **Access Level:** `Admin` Only

#### Request Body Parameters:
| Parameter | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `role` | `string` | Yes | New role: `Admin`, `Security Analyst`, `Viewer` |

---

## 4. Log Management Endpoints

### 4.1 Ingest Log File / Batch
* **Method:** `POST`
* **Path:** `/api/v1/logs/upload`
* **Access Level:** `Admin`, `Security Analyst`

#### Multipart Form Data:
| Parameter | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `file` | `file` | Yes | Log file (JSON, TXT, LOG, EVTX) |
| `log_type` | `string` | Yes | `Windows`, `Linux`, `Apache`, `Nginx`, `Firewall`, `Suricata`, `Zeek`, `Custom` |

#### Example Response (`201 Created`):
```json
{
  "status": "success",
  "data": {
    "processed_logs": 1420,
    "normalized_logs": 1420,
    "threats_detected": 3,
    "batch_id": "batch-884920"
  },
  "message": "Log batch uploaded and processed.",
  "timestamp": "2026-07-22T18:30:00Z"
}
```

---

### 4.2 Query Logs
* **Method:** `GET`
* **Path:** `/api/v1/logs/query`
* **Access Level:** All Authenticated Users

#### Query Parameters:
| Parameter | Type | Required | Default | Description |
| :--- | :--- | :---: | :--- | :--- |
| `search` | `string` | No | `null` | Full text search string |
| `log_type` | `string` | No | `null` | Filter by log type |
| `severity` | `string` | No | `null` | Filter by severity |
| `start_date`| `string` | No | `null` | ISO 8601 start timestamp |
| `end_date` | `string` | No | `null` | ISO 8601 end timestamp |
| `page` | `integer` | No | `1` | Page index |
| `limit` | `integer` | No | `50` | Records per page (Max 500) |

#### Example Response (`200 OK`):
```json
{
  "status": "success",
  "data": {
    "logs": [
      {
        "id": "669e591a2b3c4d5e6f7a8b9e",
        "timestamp": "2026-07-22T18:15:29Z",
        "hostname": "web-prod-01",
        "service": "nginx",
        "source_ip": "185.220.101.5",
        "log_type": "Nginx",
        "severity": "Critical",
        "raw_message": "185.220.101.5 - GET /api/v1/search?query=1' UNION SELECT..."
      }
    ],
    "pagination": { "total": 1, "page": 1, "pages": 1 }
  },
  "message": "Logs retrieved.",
  "timestamp": "2026-07-22T18:30:00Z"
}
```

---

## 5. Threat Alert Endpoints

### 5.1 List & Filter Alerts
* **Method:** `GET`
* **Path:** `/api/v1/alerts`
* **Access Level:** All Authenticated Users

#### Query Parameters:
| Parameter | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `severity` | `string` | No | `Critical`, `High`, `Medium`, `Low` |
| `status` | `string` | No | `New`, `Investigating`, `Resolved`, `False Positive` |
| `attack_type`| `string` | No | `Brute Force`, `SQLi`, `XSS`, etc. |
| `source_ip` | `string` | No | Target IP address filter |

#### Example Response (`200 OK`):
```json
{
  "status": "success",
  "data": {
    "alerts": [
      {
        "id": "669e5a2b3c4d5e6f7a8b9c0d",
        "alert_id": "ALT-98421",
        "timestamp": "2026-07-22T18:15:30Z",
        "severity": "Critical",
        "attack_type": "SQL Injection",
        "confidence_score": 0.98,
        "source_ip": "185.220.101.5",
        "destination_ip": "10.0.1.50",
        "country": "DE",
        "status": "New",
        "cvss_score": 8.5,
        "mitre_attack": {
          "tactic": "Initial Access",
          "technique_id": "T1190"
        }
      }
    ],
    "pagination": { "total": 1, "page": 1, "pages": 1 }
  },
  "message": "Alerts retrieved.",
  "timestamp": "2026-07-22T18:30:00Z"
}
```

---

### 5.2 Update Alert Status
* **Method:** `PATCH`
* **Path:** `/api/v1/alerts/{id}/status`
* **Access Level:** `Admin`, `Security Analyst`

#### Request Body Parameters:
| Parameter | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `status` | `string` | Yes | `Investigating`, `Resolved`, `False Positive` |

---

## 6. Incident Management Endpoints

### 6.1 Create / Escalate Incident
* **Method:** `POST`
* **Path:** `/api/v1/incidents`
* **Access Level:** `Admin`, `Security Analyst`

#### Request Body Parameters:
| Parameter | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `title` | `string` | Yes | Title summary |
| `description` | `string` | Yes | Detailed description |
| `priority` | `string` | Yes | `P1 - Critical`, `P2 - High`, `P3 - Medium`, `P4 - Low` |
| `assigned_analyst_id`| `string`| No | Target Analyst User ObjectId |
| `alert_ids` | `array[string]`| Yes | List of associated Alert ObjectIds |

#### Example Response (`201 Created`):
```json
{
  "status": "success",
  "data": {
    "incident_number": "INC-2026-0042",
    "title": "SQL Injection & Perimeter Intrusion Attempt",
    "priority": "P1 - Critical",
    "status": "Open",
    "created_at": "2026-07-22T18:30:00Z"
  },
  "message": "Incident created successfully.",
  "timestamp": "2026-07-22T18:30:00Z"
}
```

---

### 6.2 Attach Evidence File
* **Method:** `POST`
* **Path:** `/api/v1/incidents/{id}/evidence`
* **Access Level:** `Admin`, `Security Analyst`

#### Multipart Form Data:
| Parameter | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `file` | `file` | Yes | Evidence file attachment (PCAP, LOG, TXT, PNG) |

---

### 6.3 Resolve Incident
* **Method:** `PATCH`
* **Path:** `/api/v1/incidents/{id}/resolve`
* **Access Level:** `Admin`, `Security Analyst`

#### Request Body Parameters:
| Parameter | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `resolution_notes` | `string` | Yes | Mandatory resolution summary string |

---

## 7. Threat Intelligence Endpoints

### 7.1 IP Address Lookup
* **Method:** `GET`
* **Path:** `/api/v1/threat-intel/ip/{ip}`
* **Access Level:** All Authenticated Users

#### Example Response (`200 OK`):
```json
{
  "status": "success",
  "data": {
    "ip": "185.220.101.5",
    "reputation_score": 95,
    "abuseipdb": {
      "abuse_confidence_score": 100,
      "total_reports": 512,
      "domain": "tor-exit.net"
    },
    "virustotal": {
      "malicious_votes": 42,
      "harmless_votes": 0
    },
    "shodan": {
      "open_ports": [80, 443, 9001],
      "tags": ["tor", "exit-node"]
    },
    "geoip": {
      "country": "Germany",
      "city": "Frankfurt",
      "latitude": 50.1109,
      "longitude": 8.6821
    }
  },
  "message": "Threat intelligence fetched.",
  "timestamp": "2026-07-22T18:30:00Z"
}
```

---

## 8. Dashboard Metrics Endpoints

### 8.1 Executive Stats Summary
* **Method:** `GET`
* **Path:** `/api/v1/dashboard/stats`
* **Access Level:** All Authenticated Users

#### Example Response (`200 OK`):
```json
{
  "status": "success",
  "data": {
    "total_logs": 1250430,
    "critical_alerts": 12,
    "open_incidents": 4,
    "blocked_ips": 128,
    "threat_score": 84.5,
    "risk_level": "High"
  },
  "message": "Dashboard statistics retrieved.",
  "timestamp": "2026-07-22T18:30:00Z"
}
```

---

## 9. Report Management Endpoints

### 9.1 Generate PDF/CSV Report
* **Method:** `POST`
* **Path:** `/api/v1/reports/generate`
* **Access Level:** All Authenticated Users

#### Request Body Parameters:
| Parameter | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `report_type` | `string` | Yes | `Executive`, `IncidentSummary`, `AuditTrail` |
| `format` | `string` | Yes | `PDF`, `CSV`, `JSON` |
| `start_date` | `string` | Yes | ISO 8601 timestamp |
| `end_date` | `string` | Yes | ISO 8601 timestamp |

---

## 10. Real-Time WebSockets Event Protocol

### 10.1 Connection & Framing
* **WSS Endpoint:** `wss://api.sentinelai.io/ws/v1/stream?token=<JWT_ACCESS_TOKEN>`

### 10.2 Client-to-Server Messages

#### Event: `subscribe`
```json
{
  "event": "subscribe",
  "channels": ["live_logs", "alerts", "metrics"]
}
```

### 10.3 Server-to-Client Messages

#### Event: `alert_triggered`
```json
{
  "event": "alert_triggered",
  "data": {
    "alert_id": "ALT-98421",
    "severity": "Critical",
    "attack_type": "SQL Injection",
    "source_ip": "185.220.101.5",
    "timestamp": "2026-07-22T18:15:30Z"
  }
}
```

#### Event: `metrics_update`
```json
{
  "event": "metrics_update",
  "data": {
    "total_logs": 1250431,
    "critical_alerts": 13,
    "open_incidents": 4
  }
}
```
