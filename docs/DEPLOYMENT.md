# ExamPilot — Free Deployment Guide

This guide describes how to deploy the full ExamPilot three-tier microservice architecture to production completely free of charge.

---

## Recommended Platform Stack (100% Free)

| Service | Platform | Why |
|---|---|---|
| ⚛️ React Frontend | **Vercel** | Best for Vite/React, global CDN, no sleep |
| ☕ Spring Boot Backend | **Render** | Free Java hosting, 750 hrs/month |
| 🐍 FastAPI AI Service | **Render** | Free Python hosting, 750 hrs/month |

> [!IMPORTANT]
> **Free tier limitation**: Render free services **spin down after 15 minutes** of inactivity and take ~50 seconds to wake up on the first request. This is the only downside. Vercel frontend has no sleep.

> [!NOTE]
> Your database (Supabase) and image storage (Cloudinary) are already hosted in the cloud — you don't need to deploy those again.

---

## Step 1 — Deploy the React Frontend on Vercel

### 1.1 — Prepare the Frontend for Deployment

Before deploying, set your backend API URL as an environment variable instead of hardcoding it.

Check `FRONTEND/src/config/` (or your axios config) to see where the base URL is set. It should use:
```js
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4040';
```

### 1.2 — Deploy on Vercel

1. Go to **https://vercel.com** → Sign up with your GitHub account.
2. Click **"Add New Project"**.
3. Import your `EXAM-PILOT` GitHub repository.
4. Configure the project:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `FRONTEND`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Under **Environment Variables**, add:
   ```
   VITE_API_BASE_URL = https://your-spring-boot-app.onrender.com
   ```
   *(You'll get this URL after deploying the backend in Step 2 — you can add it later)*
6. Click **"Deploy"**.

Vercel will give you a URL like: `https://exam-pilot.vercel.app`

---

## Step 2 — Deploy the Spring Boot Backend on Render

### 2.1 — Create a `render.yaml` (Optional but useful)

You don't need this file — Render can auto-detect a Maven project. But you need a startup command.

The start command for Render will be:
```bash
./mvnw spring-boot:run
```
Or if you want faster cold starts, build a JAR first:
```bash
java -jar target/BACKEND-0.0.1-SNAPSHOT.jar
```

### 2.2 — Deploy on Render

1. Go to **https://render.com** → Sign up with your GitHub account.
2. Click **"New +"** → **"Web Service"**.
3. Connect your `EXAM-PILOT` GitHub repository.
4. Configure the service:
   - **Name**: `exampilot-backend`
   - **Root Directory**: `BACKEND`
   - **Environment**: `Java`
   - **Build Command**: `./mvnw clean package -DskipTests`
   - **Start Command**: `java -jar target/BACKEND-0.0.1-SNAPSHOT.jar`
   - **Instance Type**: `Free`
5. Under **Environment Variables**, add these (click "Add Environment Variable" for each):

   | Key | Value |
   |---|---|
   | `SPRING_DATASOURCE_URL` | `jdbc:postgresql://aws-1-ap-south-1.pooler.supabase.com:5432/postgres` |
   | `SPRING_DATASOURCE_USERNAME` | `postgres.zxztbcmnfueqjjlhhbes` |
   | `SPRING_DATASOURCE_PASSWORD` | `your_actual_password` |
   | `JWT_SECRET` | `your_jwt_secret_key` |
   | `JAVA_TOOL_OPTIONS` | `-Xmx400m` (limits memory for free tier) |

6. Click **"Create Web Service"**.

Render will give you a URL like: `https://exampilot-backend.onrender.com`

> [!WARNING]
> The first build takes ~5-8 minutes because Maven downloads all dependencies. Be patient.

---

## Step 3 — Deploy the FastAPI AI Service on Render

### 3.1 — Prepare a `Procfile` for the AI Service

Create a file called `Procfile` (no extension) inside `AI SERVICE/`:

```
web: python -m uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

This tells Render how to start your service.

### 3.2 — Deploy on Render

1. Go to **https://render.com** → Click **"New +"** → **"Web Service"**.
2. Connect your `EXAM-PILOT` GitHub repository again.
3. Configure the service:
   - **Name**: `exampilot-ai-service`
   - **Root Directory**: `AI SERVICE`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `python -m uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Instance Type**: `Free`
4. Under **Environment Variables**, add:

   | Key | Value |
   |---|---|
   | `GEMINI_API_KEY` | `your_gemini_api_key` |
   | `CLOUDINARY_CLOUD_NAME` | `your_cloud_name` |
   | `CLOUDINARY_API_KEY` | `your_cloudinary_api_key` |
   | `CLOUDINARY_API_SECRET` | `your_cloudinary_api_secret` |
   | `ENV` | `production` |

5. Click **"Create Web Service"**.

Render will give you a URL like: `https://exampilot-ai-service.onrender.com`

---

## Step 4 — Connect Everything Together

After all three services are deployed, update the URLs to point to each other.

### 4.1 — Update Spring Boot backend to point to deployed AI Service

In Render → `exampilot-backend` → **Environment** tab, add:
```
app.fastapi.url = https://exampilot-ai-service.onrender.com
```

Or add it as an environment variable:
| Key | Value |
|---|---|
| `FASTAPI_URL` | `https://exampilot-ai-service.onrender.com` |

And update `application.properties` to read it:
```properties
app.fastapi.url=${FASTAPI_URL:http://localhost:8000}
```

### 4.2 — Update Vercel Frontend to point to deployed Backend

In Vercel → Your project → **Settings** → **Environment Variables**:
| Key | Value |
|---|---|
| `VITE_API_BASE_URL` | `https://exampilot-backend.onrender.com` |

Then **redeploy** Vercel (it will rebuild automatically).

---

## Step 5 — Configure CORS for Production

> [!IMPORTANT]
> This is critical. Your Spring Boot backend must allow requests from your Vercel frontend URL.

In your Spring Boot CORS config (usually in `CONFIG/` folder), make sure it allows your Vercel domain:

```java
@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration config = new CorsConfiguration();
    config.setAllowedOrigins(List.of(
        "http://localhost:5173",                    // local dev
        "https://your-app.vercel.app"              // production Vercel URL
    ));
    config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
    config.setAllowedHeaders(List.of("*"));
    config.setAllowCredentials(true);
    // ...
}
```

---

## Deployment Summary

```
┌─────────────────────┐     HTTPS      ┌──────────────────────────┐
│   Vercel (Frontend) │ ────────────► │  Render (Spring Boot)    │
│  exam-pilot.app     │               │  exampilot-backend        │
└─────────────────────┘               └──────────┬───────────────┘
                                                  │
                                                  │ Internal HTTP
                                                  ▼
                                     ┌──────────────────────────┐
                                     │  Render (FastAPI)        │
                                     │  exampilot-ai-service    │
                                     └──────────┬───────────────┘
                                                  │
                                    ┌─────────────┴──────────────┐
                                    │                            │
                            ┌───────▼──────┐          ┌─────────▼──────┐
                            │   Supabase   │          │   Cloudinary   │
                            │  PostgreSQL  │          │  Image CDN     │
                            └──────────────┘          └────────────────┘
```

## Total Monthly Cost: $0.00 🎉

| Service | Platform | Cost |
|---|---|---|
| React Frontend | Vercel Free | $0 |
| Spring Boot Backend | Render Free | $0 |
| FastAPI AI Service | Render Free | $0 |
| PostgreSQL Database | Supabase Free | $0 |
| Diagram Images | Cloudinary Free | $0 |
| **Total** | | **$0** |

---

## Quick Checklist

- [ ] Create `Procfile` in `AI SERVICE/`
- [ ] Update `application.properties` to use env vars for FastAPI URL
- [ ] Update CORS config in Spring Boot to allow Vercel domain
- [ ] Sign up on Vercel & deploy Frontend
- [ ] Sign up on Render & deploy Spring Boot Backend
- [ ] Deploy FastAPI AI Service on Render
- [ ] Add all environment variables to each platform
- [ ] Update Vercel `VITE_API_BASE_URL` to point to Render backend
- [ ] Test the full flow end-to-end
