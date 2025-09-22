# Project Overview

This project, "Seedit," is a decentralized, serverless, and adminless alternative to Reddit. It functions as a client for the Plebbit protocol, a decentralized social network. Seedit is available as a web application, a desktop application (for Mac, Windows, and Linux), and a mobile application for Android.

The front-end is built with React and TypeScript, utilizing Vite for the build process. It also uses Capacitor for building the native mobile app. The desktop application is built using Electron.

# Project Structure

-   `src/`: Contains the main source code for the React application.
-   `electron/`: Contains the source code for the Electron application.
-   `android/`: Contains the source code for the Android application.
-   `public/`: Contains public assets such as images, icons, and the `index.html` file.
-   `dist/`: The output directory for the build process.

# Building and Running

## Prerequisites

-   Node.js v22
-   Yarn

## Installation

1.  Install dependencies:
    ```bash
    yarn install --frozen-lockfile
    ```

## Running the Application

-   **Web Client:**
    ```bash
    yarn start
    ```
    This will start the Vite development server on port 3000.

-   **Electron Client:**
    -   Start the web client first: `yarn start`
    -   Then, in a separate terminal, run: `yarn electron`

-   **All-in-one Electron (Web + Desktop):**
    ```bash
    yarn electron:start
    ```

## Building the Application

The build scripts for Linux, Windows, Mac, and Android are located in `.github/workflows/release.yml`. The `package.json` file also contains various build scripts for different targets:

-   **Web Client:**
    ```bash
    yarn build
    ```

-   **Electron Client (example for Linux):**
    ```bash
    yarn electron:build:linux
    ```

-   **Android Client:**
    ```bash
    yarn android:build
    ```

## Testing

-   Run unit tests with:
    ```bash
    yarn test
    ```

# Development Conventions

-   **Linting:** The project uses ESLint for code quality, extending the `react-app` configuration. The configuration is in `.eslintrc.cjs`. Unused variables will be warned.
-   **Formatting:** Prettier is used for code formatting. The configuration is in `prettier.config.cjs`. A pre-commit hook is set up to automatically format staged files.
    -   Semicolons are used.
    -   Single quotes are used for strings.
    -   JSX uses single quotes.
    -   Trailing commas are used.
    -   Print width is 170 characters.
-   **Commit Messages:** The project uses Conventional Commits, enforced by `commitizen`.

# TypeScript Configuration

The TypeScript compiler is configured in `tsconfig.json`. Key settings include:

-   **Target:** `ES2015`
-   **Module System:** `esnext`
-   **JSX:** `react-jsx`
-   **Strict Mode:** `true`

# Capacitor Configuration

Capacitor is configured in `capacitor.config.ts`. Key settings include:

-   **App ID:** `seedit.android`
-   **App Name:** `seedit`
-   **Web Directory:** `build`

# Electron Configuration

The main entry point for the Electron application is `electron/main.js`. This file is responsible for:

-   Creating the main browser window.
-   Handling IPC events for communication between the main and renderer processes.
-   Managing the application's lifecycle.
-   Implementing security measures to prevent vulnerabilities.

# React Application Structure

The main React application is structured as follows:

-   **`src/index.tsx`**: The entry point of the application. It renders the `App` component, sets up the router, initializes translations, and registers the service worker.
-   **`src/app.tsx`**: The main application component that sets up routing and the global layout.
-   **`src/views`**: Contains the different pages of the application.
-   **`src/components`**: Contains reusable components used throughout the application.
-   **`src/hooks`**: Contains custom React hooks.
-   **`src/lib`**: Contains various utility functions and libraries.
-   **`src/stores`**: Contains state management stores (likely using Zustand).
