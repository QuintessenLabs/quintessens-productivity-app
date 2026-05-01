# Quintessens Productivity App

A Notion-inspired, 4-quadrant productivity workspace. Gamify your daily routine by earning credits for healthy habits and spending them on custom rewards.

## Features
- **Daily Commissions**: Track recurring habits (Exercise, Reading, etc.)
- **Tasks**: Manage one-off or repeatable tasks
- **Skills**: Log time spent on skills to earn currency
- **Habit Shop**: Spend your earned credits on custom rewards
- **Data Portability**: Download or Import your state anytime via JSON
- **Serverless**: Runs in your browser's local storage by default

## Live Demo
[https://qprodapp.vercel.app](https://qprodapp.vercel.app)

---

## Local Setup & Development

### Prerequisites
* [Node.js](https://nodejs.org/) (v14+)
* [Git](https://git-scm.com/)

### 1. Installation
Clone the repository:
```bash
git clone https://github.com/QuintessenLabs/quintessens-productivity-app.git
cd quintessens-productivity-app
```

Install dependencies:
```bash
npm install
```

### 2. Running the App
Start the local server:
```bash
npm start
```
Visit **http://localhost:3000** in your browser.

### 3. Static Usage
Alternatively, open `index.html` directly in any modern web browser. The app will use your browser's internal storage for data persistence.

---

## Project Structure
* `index.html`: Core UI structure
* `style.css`: Minimalist styling
* `script.js`: Task logic and data persistence
* `server.js`: Optional Express backend for local saving
* `state.json`: Local data storage (used by server mode)

## Contributing
Feel free to fork the project and submit pull requests for bug fixes or UI improvements.

---
*Created by [Quintessen Labs](https://github.com/QuintessenLabs)*
