# QR-Based Attendance System

## 📌 Project Overview
**Project Name:** QR-Based Attendance System  
**Purpose:** A mobile application for parents to get notified when their child is ready for pickup.  

### 🔹 Key Features:
- **Child Registration:** Parents can register their child and generate a unique QR code.  
- **QR Code Scanning:** Caretakers scan the child's QR code to trigger a notification.  
- **Push Notifications:** Parents receive push notifications when their child is ready for pickup.  

---

## 🏗 System Architecture
- **Frontend:** React Native (Expo), Axios  
- **Backend:** Node.js with Express.js  
- **Database:** MySQL on AWS RDS  
- **Push Notifications:** Firebase Cloud Messaging (FCM)  

---

## 📜 API Documentation

### 🔑 **Authentication APIs**
- `POST /api/auth/register` → Register a child  
- `POST /api/auth/login` → Login for parents/caretakers/admins  

### 👶 **Child APIs**
- `POST /api/child/register` → Register a child  
- `GET /api/child/details` → Fetch child details  

### 🔲 **QR Code APIs**
- `POST /api/qr/scan` → Scan QR code and send notification  

### 🛠 **Admin APIs**
- `GET /api/admin/children` → Fetch all children  

### 👨‍👩‍👧 **Parent APIs**
- `GET /api/parent/dashboard` → Fetch child details for parent dashboard  

---

## 🗄 Database Schema

### 📌 **Tables**
- **Users Table:** Stores user (admin/caretaker) information.  
- **Child Info Table:** Stores child information.  

---

## 🔐 Authentication and Authorization

### 🔹 **JWT Authentication**
- Tokens are generated during login and include the user's `username` and `role`.  
- Tokens are valid for **1 hour**.  

### 🔹 **Role-Based Access**
| Role      | Permissions |
|-----------|------------|
| **parent** | Can view child details and receive notifications. |
| **caretaker** | Can scan QR codes and mark attendance. |
| **admin** | Can manage all users and children. |

---

## 📢 Push Notifications

### 🔹 **FCM Setup**
- Firebase project configuration.  
- Device token generation in the React Native app.  

### 🔹 **Notification Flow**
- When a **QR code is scanned**, the backend sends a **notification to the parent's device token**.  

### 🔹 **Error Handling**
- Handle cases where the **device token is invalid or missing**.  

---

## 🚀 Getting Started

### 1️⃣ **Clone the Repository**
```sh
git clone https://github.com/your-username/QR-App.git
cd QR-App
