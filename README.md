# 💻 CodeEditor: Interactive Multi-Language Playground

This project is a modern, feature-rich web-based code editor and execution playground. It allows developers to write code in multiple popular languages, instantly execute it using the Piston API, and view the results, errors, or output in a responsive side-by-side interface.

It is built as a highly interactive and aesthetically pleasing application, complete with dynamic UI elements and a foundation for next-generation features like voice commands.

-----

## ✨ Key Features

  * **Multi-Language Support**: Supports and executes code in over 10 languages, including JavaScript, Python, C++, and Rust.
  * **Advanced Monaco Editor**: Provides a professional coding experience with syntax highlighting, automatic layout, and customizable themes and font sizes.
  * **Real-Time Execution**: Integrates with the **Piston API** for remote code execution and returns outputs or detailed error messages.
  * **Custom Theming**: Features multiple themes for the Monaco editor, including **VS Dark**, **GitHub Dark**, **Monokai**, and **Solarized Dark**.
  * **Simulated Voice Command Button**: Includes a styled **Voice Command** button that animates through **"Connecting..."** and **"Listening..."** states upon click, establishing the UI foundation for a future voice assistant integration.

-----

## ⚙️ Tech Stack

  * **Framework**: Next.js (v15.5.6).
  * **UI/Styling**: React (v19.2.0) with Tailwind CSS and Framer Motion for modern animations.
  * **State Management**: Zustand.
  * **Editor**: Monaco Editor (`@monaco-editor/react`).
  * **Executor**: Piston API (`https://emkc.org/api/v2/piston/execute`).

-----

## 🌐 Supported Languages

The playground supports a variety of compiled and interpreted languages:

  * **JavaScript** (Runtime v18.15.0)
  * **TypeScript** (Runtime v5.0.3)
  * **Python** (Runtime v3.10.0)
  * **Java** (Runtime v15.0.2)
  * **Go** (Runtime v1.16.2)
  * **Rust** (Runtime v1.68.2)
  * **C++** (Runtime v10.2.0)
  * **C\#** (Runtime v6.12.0)
  * **Ruby** (Runtime v3.0.1)
  * **Swift** (Runtime v5.3.3)

-----

## 🚀 Getting Started

To set up and run this project locally, follow the standard Next.js procedures.

### 1\. Prerequisites

Make sure you have [Node.js](https://nodejs.org/en) (v18.18.0 or later recommended) and npm/yarn/pnpm installed.

### 2\. Installation

Navigate to the project directory and install the dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3\. Run Locally

Start the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

The application should now be running and accessible at:

> [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000)

You can now start editing the code in the editor and clicking **Run Code** to see your outputs.
