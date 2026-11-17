# Complaint Registration and Tracking System in Java (OOP Showcase & Web Application)

A dual-tier enterprise application implementing a **Complaint Registration and Tracking System** designed around core **Java Object-Oriented Programming (OOP)** principles. 

This repository contains both:
1. **The Native Java 17 Backend/CLI Application**: Complete source code adhering to enterprise OOP standards (`Priority`, `Status`, `Trackable`, `ComplaintNotFoundException`, `Complaint`, `User`, `Customer`, `Admin`, `ComplaintService`, `Main`).
2. **The Interactive Web Application**: A full-featured web portal with role-based access (Customer & Admin), interactive Java terminal simulator with a 13-screen replay mode, real-time ticket tracking stepper, Java OOP Concept Explorer, and visual UML class diagrams.

---

## 🌟 Key Features

### 1. Customer Portal
- **User Registration & Login**: Role-based access with secure authentication.
- **File Complaints**: Specify category (*Billing*, *Service*, *Product*, *Other*), description, and priority (*LOW*, *MEDIUM*, *HIGH*).
- **Auto-Generated ID**: Thread-safe sequential ID generator starting at `#1001`.
- **Live Lifecycle Tracking**: Interactive visual stepper tracking status progression:
  $$\text{REGISTERED} \longrightarrow \text{IN\_PROGRESS} \longrightarrow \text{RESOLVED}$$
- **My Complaints View**: Filter and inspect personal submitted grievances and administrator remarks.

### 2. Administrator Command Center
- **Master Complaint Repository**: Fast \(O(1)\) lookup and chronological order powered by `LinkedHashMap`.
- **Status & Remarks Management**: Update ticket status to `REGISTERED`, `IN_PROGRESS`, or `RESOLVED` with custom official remarks.
- **Live Operational KPIs**: Instant visual count of Total, Registered, In-Progress, and Resolved tickets.
- **Summary Report Generator**: Automated summary analytics matching academic report standards.

### 3. Java Terminal & Console Simulator
- **Interactive CLI**: Experience the command-line menu (`1. Register`, `2. Login`, `3. Exit`) directly in the browser.
- **13-Screen Replay Mode**: Step-by-step slideshow replaying the exact 13 terminal screens from the academic project PDF, including exception test cases (`ComplaintNotFoundException`, invalid priorities, and invalid credentials).

### 4. Java OOP Educational Deep-Dive Explorer
- Dedicated visual breakdown of 8 core OOP concepts:
  1. **Class & Object**: `Complaint` & `ComplaintService`
  2. **Encapsulation**: Private fields, immutable IDs, controlled setters
  3. **Inheritance**: `User` superclass extended by `Customer` and `Admin`
  4. **Abstraction**: `abstract class User` & `interface Trackable`
  5. **Polymorphism**: Dynamic method dispatch on `getRole()` and `updateStatus()`
  6. **Enumerations**: `Priority` and `Status` enums enforcing compile-time safety
  7. **Exception Handling**: `ComplaintNotFoundException` handling invalid queries
  8. **Collections Framework**: `LinkedHashMap<Integer, Complaint>` & `ArrayList<User>`

---

## 📁 Repository Structure

```
d:\JAVA\
├── src\                                  # Native Java 17 Source Files
│   ├── Priority.java                     # Urgency level Enum (LOW, MEDIUM, HIGH)
│   ├── Status.java                       # Lifecycle state Enum (REGISTERED, IN_PROGRESS, RESOLVED)
│   ├── Trackable.java                    # Interface contract for trackable objects
│   ├── ComplaintNotFoundException.java   # Custom checked exception
│   ├── Complaint.java                    # Core entity implementing Trackable
│   ├── User.java                         # Abstract base class
│   ├── Customer.java                     # Inherits User (role: CUSTOMER)
│   ├── Admin.java                        # Inherits User (role: ADMIN)
│   ├── ComplaintService.java             # LinkedHashMap & business logic
│   └── Main.java                         # Console CLI entry point
├── bin\                                  # Compiled bytecode (.class files)
├── index.html                            # Interactive Web Application
├── styles.css                            # Modern responsive stylesheet
├── app.js                               # Application engine & Terminal simulator
├── server.js                             # Zero-dependency local Node.js HTTP server
├── start.bat                             # Windows launcher script
└── README.md                             # Documentation
```

---

## 🚀 Quick Start Guide

### Option A: Launch Web Application
You can run the web server using Node.js:
```powershell
node server.js
```
Then navigate to: **`http://localhost:3000`** in your web browser.

*(Alternatively, you can double-click `index.html` to open it directly in any browser!)*

### Option B: Compile & Run Java Console Application
To compile and execute the native Java console application:
```powershell
# 1. Compile
javac -d bin src\*.java

# 2. Run
java -cp bin Main
```

### Option C: Using Windows Launcher
Simply double-click **`start.bat`** and choose:
- `1` to launch the Web Portal
- `2` to run the Java Console App

---

## 🔑 Demo Credentials

| Role | Username | Password | Notes |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin` | `admin123` | Default administrative account |
| **Customer** | `dinesh` | `dinesh123` | Has Complaint #1001 |
| **Customer** | `ram` | `ram123` | Has Complaint #1002 |
| **Customer** | `sita` | `sita123` | Has Complaint #1003 |
| **Customer** | `priya` | `priya123` | Has Complaint #1004 |
| **Customer** | `raj` | `raj123` | Has Complaint #1005 |
