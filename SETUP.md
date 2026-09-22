# Smart Campus Maintenance System (SCMS) - Developer Setup Guide

## Quick Start (Development)

### 1. Starting the Backend (Spring Boot)
The backend uses `dotenv-java` to automatically load environment configuration from `backend/.env` on startup.

**Using PowerShell / Terminal:**
```powershell
# From project root
.\run-backend.ps1

# Or directly with Maven
cd backend
mvn spring-boot:run
```

**Backend Health Check:**
- API Documentation / Swagger: [http://localhost:8080/v3/api-docs](http://localhost:8080/v3/api-docs)
- Swagger UI: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)

---

### 2. Starting the Frontend (Next.js 14)

```powershell
# From project root
cd java-PBL
pnpm dev
```

**Frontend Access:**
- Web Portal: [http://localhost:3000](http://localhost:3000)
- Login: [http://localhost:3000/login](http://localhost:3000/login)
- Registration: [http://localhost:3000/register](http://localhost:3000/register)

---

### 3. Default Admin Credentials

| Account | Email | Password | Role |
| :--- | :--- | :--- | :--- |
| **Campus Main Admin** | `admin@gmail.com` | `Aswinabi1*` | `MAIN_ADMIN` |

---

### 4. Google OAuth2 Configuration
Configuration is located in `backend/.env`:
```env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
```
**Google Cloud Console Settings:**
- **Authorized JavaScript Origins**: `http://localhost:3000`, `http://localhost:8080`
- **Authorized Redirect URI**: `http://localhost:8080/login/oauth2/code/google`
