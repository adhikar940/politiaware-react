# Politiaware - Frontend (Ionic + React)

A modern cross-platform mobile and web application for Politiaware built with **React 19**, **Ionic Framework 9**, **TypeScript**, and **Vite**, powered by **Capacitor 7** for native iOS and Android deployment.

---

## 🛠 Tech Stack

- **Framework**: [React 19](https://react.dev/) & [TypeScript](https://www.typescriptlang.org/)
- **UI Components**: [Ionic React 9](https://ionicframework.com/docs/react) & [Material UI (MUI v7)](https://mui.com/)
- **Build Tool**: [Vite 5](https://vitejs.dev/)
- **Mobile Runtime**: [Capacitor 7](https://capacitorjs.com/)
- **API & Data Fetching**: [Apollo Client](https://www.apollographql.com/docs/react/) (GraphQL) & [Axios](https://axios-http.com/)
- **Routing**: [Ionic React Router](https://ionicframework.com/docs/react/navigation) (React Router v6)
- **Charts & Maps**: [Chart.js](https://www.chartjs.org/) & [Leaflet](https://leafletjs.com/)
- **Testing**: [Vitest](https://vitest.dev/) (Unit) & [Cypress](https://www.cypress.io/) (E2E)

---

## 📋 Prerequisites

Ensure you have the following installed on your system:

- **Node.js**: `v18.x` or `v20.x` (LTS recommended)
- **npm**: `v9.x` or higher (bundled with Node.js)
- **(Optional) Ionic CLI**:
  ```bash
  npm install -g @ionic/cli
  ```
- **Backend Service**: Ensure the Politiaware Django backend is running (default: `http://localhost:9000`).
- **(For Mobile Builds)**:
  - **Android**: Android Studio, JDK 17+, Android SDK
  - **iOS**: macOS with Xcode 15+ and CocoaPods

---

## ⚙️ Installation

1. **Navigate to the project directory**:
   ```bash
   cd politiaware-react
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

---

## 🔧 Configuration

The application supports build-time and runtime endpoint configuration for the Django GraphQL backend:

1. **Environment Variables (`.env` / `.env.production`)**:
   ```env
   VITE_GRAPHQL_ENDPOINT=https://politiaware-backend.onrender.com/graphql/async/
   VITE_SECONDARY_GRAPHQL_ENDPOINT=https://politiaware-api-gcp.samadhikar.com/graphql/async
   VITE_PRIMARY_TIMEOUT_MS=3000
   ```

2. **Runtime Configuration (`public/config.json`) & Cloudflare Pages**:
   If dynamic runtime overrides or app update gates are required without rebuilding:
   ```json
   {
     "GRAPHQL_BACKENDURL": "https://politiaware-backend.onrender.com/graphql/async/",
     "SECONDARY_GRAPHQL_BACKENDURL": "https://politiaware-api-gcp.samadhikar.com/graphql/async",
     "PRIMARY_TIMEOUT_MS": 3000,
     "MIN_APP_VERSION": "0.0.1",
     "LATEST_APP_VERSION": "0.0.1",
     "FORCE_UPDATE": false,
     "ANDROID_UPDATE_URL": "https://play.google.com/store/apps/details?id=io.ionic.starter",
     "UPDATE_RELEASE_NOTES": "Latest civic dataset, bug fixes, and performance improvements."
   }
   ```
   - **Failover Mechanism**: All GraphQL queries (Apollo Client and `fetchGraphQL`) first query the Primary endpoint (`politiaware-backend.onrender.com`). If no response is received in 3 seconds (or if a 5xx error occurs), the request automatically fails over to the Secondary GCP endpoint (`politiaware-api-gcp.samadhikar.com`).
   - **Mandatory Update**: When the installed Politiaware app version is strictly below `MIN_APP_VERSION` (or if `FORCE_UPDATE` is `true`), users are blocked by a non-dismissible dialog until they update.
   - **Optional Update**: When the installed Politiaware app version is between `MIN_APP_VERSION` and `LATEST_APP_VERSION`, users receive an update prompt with a "Remind Me Later" option.

3. **Django Backend Settings (`settings.py`)**:
   Configure Django to accept requests from both Cloudflare Pages and the Capacitor Mobile App (`app.politiaware.com`):
   ```python
   ALLOWED_HOSTS = [
       "politiaware-backend.onrender.com",
       ".onrender.com",
       "localhost",
       "127.0.0.1",
   ]

   CSRF_TRUSTED_ORIGINS = [
       "https://politiaware-react.pages.dev",  # Cloudflare Pages Web
       "https://*.pages.dev",                  # Cloudflare preview builds
       "https://app.politiaware.com",          # Android & iOS Capacitor mobile origin
   ]

   CORS_ALLOWED_ORIGINS = [
       "https://politiaware-react.pages.dev",
       "https://app.politiaware.com",
   ]
   CORS_ALLOWED_ORIGIN_REGEXES = [
       r"^https://.*\.pages\.dev$",
   ]
   ```


---

## 🚀 Execution & Development

### 1. Run Development Server (Web)

Start the local Vite development server with Hot Module Replacement (HMR):

```bash
npm run dev
```

Or using Ionic CLI:
```bash
ionic serve
```

The app will be accessible at:
👉 **`http://localhost:5173`** (or the port indicated in terminal)

---

### 2. Build for Production

Compile TypeScript and build optimized static assets into the `dist/` directory:

```bash
npm run build
```

To locally test the production build:
```bash
npm run preview
```

---

## 📱 Mobile Development (Capacitor)

Capacitor bridges your web app to native iOS and Android platforms.

### Step 1: Build the Web App
Before syncing with native platforms, build the web distribution assets:
```bash
npm run build
```

### Step 2: Add Native Platforms (One-time setup)
```bash
# For Android
npx cap add android

# For iOS (macOS only)
npx cap add ios
```

### Step 3: Sync Web Assets & Plugins
Every time you make changes and rebuild (`npm run build`), sync native projects:
```bash
npx cap sync
```

### Step 4: GitHub Actions deployment

The workflow in `.github/workflows/build-and-deploy.yml` runs only when you
manually start it. It builds the selected branch twice:

- deploys `dist/` to Cloudflare Pages;
- builds a debug Android APK and publishes it as a workflow artifact.

Configure these GitHub repository values before the first run:

- Secret `CLOUDFLARE_API_TOKEN`: a Cloudflare API token with Pages edit access;
- Secret `CLOUDFLARE_ACCOUNT_ID`: the Cloudflare account ID;
- Repository variable `CLOUDFLARE_PAGES_PROJECT`: the Cloudflare Pages project name.

To deploy, open the repository's **Actions** tab, select **Build and deploy**,
click **Run workflow**, choose the branch, and click **Run workflow** again.
Normal pushes will not deploy automatically.

Download the APK from the completed workflow's **Artifacts** section. A debug
APK is suitable for testing. Publishing a release AAB to Google Play requires
an Android signing key and Google Play service-account credentials, which should
be added as GitHub secrets separately.

### Step 5: Open in Native IDE / Run on Device

- **Android (Android Studio)**:
  ```bash
  npx cap open android
  ```
  Or run directly to a connected device/emulator:
  ```bash
  npx cap run android
  ```

- **iOS (Xcode - macOS only)**:
  ```bash
  npx cap open ios
  ```
  Or run directly:
  ```bash
  npx cap run ios
  ```

---

## 🧪 Testing & Quality Checks

### Run Unit Tests (Vitest)
```bash
npm run test.unit
```

### Run End-to-End Tests (Cypress)
```bash
npm run test.e2e
```

### Run Linter (ESLint)
```bash
npm run lint
```

---

## 📁 Project Structure

```text
politiaware-react/
├── public/               # Static assets & runtime config
│   ├── config.json       # Backend API endpoint configuration
│   └── favicon.png
├── src/
│   ├── assets/           # Images, fonts, and media
│   ├── components/       # Reusable UI components
│   ├── customhooks/      # Custom React hooks
│   ├── pages/            # View pages and routing views
│   ├── services/         # API services & Apollo Client setup
│   ├── theme/            # Ionic and custom themes/CSS
│   ├── App.tsx           # Main application routing & root component
│   ├── config.ts         # Runtime config loader
│   ├── main.tsx          # React application entrypoint
│   └── setupTests.ts     # Vitest test configurations
├── capacitor.config.ts   # Capacitor mobile configuration
├── ionic.config.json     # Ionic CLI configuration
├── vite.config.ts        # Vite build & test configuration
├── package.json          # Dependencies & npm scripts
└── Readme.md             # Project documentation
```
