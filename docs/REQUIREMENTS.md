# Product Requirements Document (PRD): ACME Global Salary Management

**Author:** Staff Product & Engineering Lead  
**Audience:** HR Leadership, Engineering Stakeholders, Executive Team  
**Status:** Approved for Implementation  
**Target Organization Size:** 10,000 Employees across 7 Countries  

---

## 1. Executive Summary & Problem Statement
Currently, ACME Organization's HR team manages compensation data for 10,000 employees distributed across multiple countries using fragmented spreadsheets. This legacy process introduces significant business risks:
- **Operational Inefficiency:** Manual formula maintenance, slow spreadsheet lookups, and error-prone cross-currency calculations.
- **Data Integrity & Audit Deficits:** Inability to track who changed a salary, why, and when, lacking a verifiable audit trail.
- **Reporting Blindspots:** Inability for HR leadership to promptly and accurately answer core organizational compensation questions (e.g., *"What is our total engineering payroll in India versus the US?"*, *"What is our departmental salary distribution?"*).
- **Security & Concurrency Fragility:** Spreadsheets lack granular field-level auditing, relational referential integrity, and concurrent edit protections.

**Goal:** Deliver a modern, centralized, high-performance web platform that empowers the HR Manager to securely browse, search, update, audit, and analyze compensation for 10,000+ global employees with sub-second responsiveness.

---

## 2. User Persona
- **Primary Persona:** **HR Manager (Global People Operations)**
  - *Needs:* Real-time visibility into global headcount and payroll spend, instant answers to compensation distribution questions, rapid search/filtering across 10,000 records, and a frictionless, reliable workflow to update salaries with full audit history.
  - *Pain Points:* Slow spreadsheets, currency ambiguity (e.g., comparing INR to USD nominal figures), fear of unlogged salary adjustments.

---

## 3. Scope & Core Features

### 3.1 Global Employee Directory & High-Scale Browsing
- Paginated, indexed browsing of 10,000 employees with sub-50ms query response times.
- Real-time search across Employee Code, First Name, Last Name, and Corporate Email.
- Multi-dimensional filtering by Department (Engineering, Sales, Marketing, HR, Finance, Operations, Product, Legal), Country/Office (US, UK, India, Germany, Canada, Singapore, Australia), Employment Status (Active, On Leave, Terminated), and Salary Ranges.
- Multi-column sorting (Salary, Name, Effective Date).

### 3.2 Multi-Currency Compensation & Integrity
- Explicit local currency preservation (`USD`, `EUR`, `GBP`, `INR`, `CAD`, `SGD`, `AUD`) for contractual accuracy.
- Separation of Base Salary and Annual Incentive/Bonus.
- Standardized reporting conversion engine (USD benchmark) with transparent exchange rates for org-wide analytics, ensuring local nominal amounts are never mistakenly summed across different currencies.

### 3.3 Salary Adjustment Workflow & Immutable Audit Log
- Modal-driven salary modification interface requiring effective date, reason code (Promotion, Annual Merit Review, Market Adjustment, Equity Correction), and optional HR notes.
- Automatic generation of an immutable `SalaryHistory` audit event wrapped in database transactions.
- Interactive timeline visualization of an employee’s historical compensation changes.

### 3.4 Compensation Analytics & "Org Pay" Insights Engine
- **Macro KPI Cards:** Global Payroll (Converted USD), Active Headcount, Median & Average Salary, Annual Bonus pool.
- **Departmental & Regional Aggregations:** Spend distribution by business unit and geography.
- **"Ask Compensation" Query Assistant:** Pre-configured and interactive analytical answers to executive questions:
  - *How much does each department cost?*
  - *What is the gender/pay tier distribution across geographies?*
  - *Who are the top compensation outliers?*

---

## 4. Deliberate Non-Goals & Scope Exclusions (With Reasoning)

| Excluded Feature | Engineering & Product Rationale |
| :--- | :--- |
| **Complex Multi-Step Payroll Disbursal (Direct Deposit/Tax Filing)** | This is a *Salary Management & Compensation Intelligence* system, not an automated banking clearing house (e.g., ADP/Gusto payroll runner). Scope is focused on compensation governance and analytics. |
| **Full Employee Self-Service Portal** | The target persona for this milestone is strictly the **HR Manager & People Ops**. Providing employee self-service login adds auth complexity (SSO/2FA/SAML) without serving the primary problem statement. |
| **Dynamic Third-Party Live FX Ticker Integration** | Real-time forex swings create daily volatility in budgeting reports. In corporate compensation, companies use fixed quarterly or annual planning exchange rates (Corporate Standard Rates). We implement explicit, versioned reporting rates. |
| **Unbounded In-Browser Dataset Loading (Client-side 10k array)** | Pushing 10,000 JSON records to the browser tab degrades memory, breaks mobile browsers, and violates enterprise data transfer standards. Pagination and server-side aggregation are enforced. |

---

## 5. Non-Functional Requirements & Performance Targets
- **Dataset Size:** Exactly 10,000 deterministic, realistic employee records generated via seed script.
- **Performance Budget:** P95 response time < 80ms for search/filter queries on SQLite with compound indexes.
- **Data Precision:** Monetary values stored as `DECIMAL(14, 2)` (never IEEE 754 floating points).
- **Test Coverage:** Automated unit and request tests covering salary updates, audit creation, currency conversions, and analytics aggregations.
