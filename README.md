# Random Quote Generator

A modern, responsive React application that fetches and displays random quotes. Built with Vite and React.

## Features

- **Random Quotes:** Fetches quotes from a public API (`dummyjson.com/quotes`).
- **Length Filtering:** Filter quotes by length:
  - Any Length
  - Short (< 50 characters)
  - Medium (50 - 120 characters)
  - Long (> 120 characters)
- **Copy to Clipboard:** Easily copy your favorite quotes to your clipboard with a single click (with visual confirmation).
- **Loading States:** Visual feedback (spinner and button states) while fetching quotes.

## Technologies Used

- **React (v19):** For building the user interface.
- **Vite:** Next Generation Frontend Tooling for fast development.
- **Lucide React:** For clean, customizable SVG icons.
- **CSS3:** For styling and responsive design.

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Muhammed-Sahal717/quote-app.git
   cd quote-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to the local server URL provided by Vite (usually `http://localhost:5173`).

## Available Scripts

In the project directory, you can run:

- `npm run dev`: Starts the development server.
- `npm run build`: Builds the app for production to the `dist` folder.
- `npm run preview`: Previews the production build locally.
- `npm run lint`: Runs ESLint to check for code issues.
