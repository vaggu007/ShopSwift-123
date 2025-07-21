# ShopSwift Project Setup Guide

This document explains how to set up the backend (Node/Express) and frontend (React) for local development.

---

## 1. Backend (Node.js + Express)

**Folder:** `/server`

**Setup Steps:**
1. Open a terminal and navigate to the `/server` folder:
ShopSwift-Capstone-2025/
│
├── assets/
├── client/            # React Frontend
├── docs/              # Documentation (this file is here)
├── server/            # Node.js/Express Backend
├── src/
└── README.md
---

## 2. Backend Setup (Node.js/Express)

**Location:** `server/`

### Steps:
1. **Open Terminal** in VS Code.
2. Navigate to the backend folder:
cd server
3. **Install dependencies:**
npm install
4. **Run the backend server:**
node server.js
or (if there is a `start` script in package.json):
npm start
5. **Open your browser** and visit:  
[http://localhost:5050](http://localhost:5050)  

---

## 3. Frontend Setup (React)

**Location:** `client/`

### Steps:
1. **Open a new Terminal** window/tab in VS Code.
2. Navigate to the frontend folder:
cd client
3. **Install dependencies:**
npm install
4. **Run the React dev server:**
npm start
5. **Open your browser** and visit:  
[http://localhost:3000](http://localhost:3000)  
(Or whichever port is shown in the terminal.)

---

## 4. Branches (Collaboration Workflow)

- `main` – Stable/production-ready code
- `frontend-palak` – Frontend code (React)
- `docs-pruthvi` – Documentation work
- Other branches for features or fixes as needed


---

## 5. Troubleshooting/Common Errors

- **Port in use:**  
Change the `PORT` value in your `server.js` or stop the app using that port.
- **Missing dependencies:**  
Always run `npm install` after pulling new code.
- **Node version:**  
Recommended: Node.js v16 or above.
- **Permission errors:**  
Run VS Code as administrator (Windows) or use `sudo` if necessary (Mac/Linux).

---


---

## 7. Quick Start (Summary)

```sh
# 1. Backend
cd server
npm install
npm start

# 2. Frontend (new terminal)
cd client
npm install
npm start