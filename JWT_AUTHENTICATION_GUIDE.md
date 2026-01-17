# 🔐 JWT Authentication - Production Ready Guide

## ✅ Implementation Status: INDUSTRY STANDARD

Your authentication system now follows **industry-standard security best practices** for JWT-based authentication.

---

## 📋 What Was Implemented

### 1. **HttpOnly Cookies (Secure Token Storage)**

- ✅ Access tokens stored in HttpOnly cookies
- ✅ Refresh tokens stored in HttpOnly cookies
- ✅ Cookies not accessible via JavaScript (prevents XSS attacks)
- ✅ `secure: true` flag (HTTPS only in production)
- ✅ `sameSite: "strict"` (prevents CSRF attacks)

### 2. **Token Lifetimes**

- ✅ Access Token: 15 minutes (configurable)
- ✅ Refresh Token: 7 days (configurable)
- ✅ Short-lived access tokens minimize damage if compromised

### 3. **Refresh Token Rotation**

- ✅ Old refresh token revoked when used
- ✅ New refresh token issued with each refresh
- ✅ Refresh tokens stored in database (hashed with SHA-256)
- ✅ Automatic cleanup via MongoDB TTL index

### 4. **Proper Logout**

- ✅ Both cookies cleared on logout
- ✅ Refresh token revoked in database
- ✅ Tracks IP address for security audit

### 5. **Automatic Token Refresh**

- ✅ Frontend automatically refreshes expired access tokens
- ✅ No user interaction required
- ✅ Seamless UX - user never sees "session expired"

### 6. **Frontend Implementation**

- ✅ No localStorage usage
- ✅ No sessionStorage usage
- ✅ Tokens never exposed to JavaScript
- ✅ `axios.defaults.withCredentials = true`
- ✅ `credentials: 'include'` on all fetch calls

---

## 🏗️ Architecture Overview

```
┌─────────────┐                    ┌─────────────┐
│   Browser   │                    │   Server    │
│             │                    │             │
│  ┌────────┐ │                    │  ┌────────┐ │
│  │No Token│ │  1. Login POST     │  │Validate│ │
│  │Storage │ │─────────────────────>│  │Creds  │ │
│  └────────┘ │                    │  └────────┘ │
│             │  2. Set Cookies    │             │
│             │<─────────────────────┤             │
│             │  (accessToken +    │             │
│             │   refreshToken)    │             │
│             │                    │             │
│  API Call   │  3. Request        │  Verify     │
│  with       │─────────────────────>│  Access    │
│  Cookies    │  (Auto-send cookies)│  Token     │
│             │                    │             │
│             │  4. 401 Expired?   │             │
│  Auto       │<─────────────────────┤             │
│  Refresh    │  5. POST /refresh  │  Issue New  │
│             │─────────────────────>│  Tokens    │
│             │  6. New Cookies    │  (Rotate)   │
│             │<─────────────────────┤             │
└─────────────┘                    └─────────────┘
```

---

## 🔧 Configuration

### Backend Environment Variables

Create a `.env` file in the `backend/` directory:

```env
# JWT Configuration
JWT_SECRET=your-super-secure-random-secret-min-32-chars-here
ACCESS_TOKEN_TTL_MINUTES=15
REFRESH_TOKEN_TTL_DAYS=7

# Environment (CRITICAL for security)
NODE_ENV=production

# Database
MONGO_URI=your-mongodb-connection-string

# CORS (Update for production)
CORS_ORIGINS=https://yourdomain.com,https://admin.yourdomain.com
```

### Frontend Environment Variables

**Website** (`.env` in `Website/`):

```env
VITE_API_BASE_URL=https://api.yourdomain.com
```

**Admin Frontend** (`.env` in `adminFrontend/`):

```env
VITE_API_BASE_URL=https://api.yourdomain.com
```

---

## 🚀 How It Works

### Login Flow

1. User submits credentials to `POST /api/auth/login`
2. Server validates credentials
3. Server creates:
   - Access token (JWT, 15 min)
   - Refresh token (random 96 chars, 7 days)
4. Server sets HttpOnly cookies:

   ```javascript
   res.cookie("accessToken", accessToken, {
     httpOnly: true,
     secure: true, // HTTPS only
     sameSite: "strict",
     maxAge: 15 * 60 * 1000,
   });

   res.cookie("refreshToken", refreshToken, {
     httpOnly: true,
     secure: true,
     sameSite: "strict",
     maxAge: 7 * 24 * 60 * 60 * 1000,
   });
   ```

5. Server stores hashed refresh token in database
6. Client receives user data (no tokens in response body)

### Protected API Requests

1. Browser automatically sends cookies with every request
2. Middleware extracts `accessToken` from cookie
3. JWT verified and decoded
4. Request proceeds with `req.user` populated

### Token Refresh (Automatic)

1. Access token expires (15 min)
2. API returns 401 Unauthorized
3. Frontend intercepts 401, calls `POST /api/auth/refresh`
4. Server:
   - Verifies refresh token from cookie
   - Checks if revoked or expired
   - Issues new access token
   - **Rotates refresh token** (old one revoked, new one issued)
5. Frontend retries original request
6. User never notices (seamless UX)

### Logout Flow

1. User clicks logout
2. Frontend calls `POST /api/auth/logout`
3. Server:
   - Clears cookies
   - Revokes refresh token in database
4. User redirected to login

---

## 🛡️ Security Features

### 1. **Protection Against XSS**

- Tokens stored in HttpOnly cookies (not accessible via JavaScript)
- Even if attacker injects script, they can't steal tokens

### 2. **Protection Against CSRF**

- `sameSite: "strict"` prevents cross-site cookie sending
- Cookies only sent to same origin

### 3. **Protection Against Token Theft**

- Access tokens short-lived (15 min damage window)
- Refresh tokens rotated on use (one-time use)
- Refresh tokens hashed in database

### 4. **Protection Against Replay Attacks**

- Refresh tokens revoked after use
- Tracks `replacedByTokenHash` for audit trail

### 5. **IP Address Tracking**

- Logs IP on token creation and revocation
- Helps detect suspicious activity

---

## 📝 API Endpoints

### Authentication

#### `POST /api/auth/login`

Login with credentials, receive cookies.

**Request:**

```json
{
  "phone": "+1234567890",
  "password": "yourpassword"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "...",
    "name": "...",
    "email": "...",
    "role": "customer"
  }
}
```

**Cookies Set:**

- `accessToken` (HttpOnly, 15 min)
- `refreshToken` (HttpOnly, 7 days)

---

#### `POST /api/auth/refresh`

Refresh access token using refresh token.

**Request:** No body required (uses cookie)

**Response:**

```json
{
  "success": true,
  "user": { ... }
}
```

**Cookies Updated:**

- New `accessToken`
- New `refreshToken` (rotation)

---

#### `POST /api/auth/logout`

Logout and revoke refresh token.

**Request:** No body required

**Response:**

```json
{
  "success": true,
  "message": "Logout successful"
}
```

**Cookies Cleared:**

- `accessToken`
- `refreshToken`

---

#### `GET /api/auth/me`

Get current authenticated user.

**Request:** No body required (uses cookie)

**Response:**

```json
{
  "success": true,
  "user": { ... }
}
```

---

## 🧪 Testing

### 1. Test Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone": "+1234567890", "password": "test123"}' \
  -c cookies.txt
```

### 2. Test Protected Route

```bash
curl -X GET http://localhost:5000/api/auth/me \
  -b cookies.txt
```

### 3. Test Token Refresh

```bash
# Wait 15 minutes for access token to expire, then:
curl -X GET http://localhost:5000/api/auth/me \
  -b cookies.txt  # Should return 401

curl -X POST http://localhost:5000/api/auth/refresh \
  -b cookies.txt \
  -c cookies.txt  # Get new tokens

curl -X GET http://localhost:5000/api/auth/me \
  -b cookies.txt  # Should work now
```

### 4. Test Logout

```bash
curl -X POST http://localhost:5000/api/auth/logout \
  -b cookies.txt
```

---

## ✅ Production Checklist

### Backend

- [ ] `NODE_ENV=production` in environment
- [ ] Strong `JWT_SECRET` (min 32 chars random)
- [ ] HTTPS enabled on server
- [ ] CORS configured with production origins
- [ ] MongoDB secured with authentication
- [ ] Rate limiting enabled on auth endpoints
- [ ] Refresh token cleanup job running

### Frontend

- [ ] HTTPS enabled
- [ ] `VITE_API_BASE_URL` points to production API
- [ ] No console.log statements with sensitive data
- [ ] Error messages don't leak system info

### Infrastructure

- [ ] SSL/TLS certificates valid
- [ ] Firewall rules configured
- [ ] Database backups enabled
- [ ] Monitoring and alerting setup

---

## 🚫 What NOT to Do

### ❌ **Never Do These:**

1. Store JWT in localStorage
2. Store JWT in sessionStorage
3. Send JWT in response body
4. Use long-lived access tokens (>1 hour)
5. Skip refresh token rotation
6. Use `httpOnly: false`
7. Skip `secure: true` in production
8. Expose tokens to JavaScript

### ✅ **Always Do These:**

1. Use HttpOnly cookies
2. Keep access tokens short-lived (5-15 min)
3. Rotate refresh tokens on use
4. Enable HTTPS in production
5. Set `sameSite: "strict"`
6. Hash refresh tokens in database
7. Revoke tokens on logout
8. Log security events

---

## 📊 Database Schema

### RefreshToken Model

```javascript
{
  subjectId: ObjectId,      // User or Professional ID
  subjectType: String,      // "user" or "professional"
  tokenHash: String,        // SHA-256 hash
  expiresAt: Date,          // Auto-cleanup via TTL index
  createdByIp: String,      // Security audit
  revokedAt: Date,          // Logout or rotation
  revokedByIp: String,      // Security audit
  replacedByTokenHash: String  // Rotation trail
}
```

---

## 🔄 Migration Guide (From Old System)

If you were using localStorage before:

### Frontend Changes

1. Remove all `localStorage.getItem('token')`
2. Remove all `localStorage.setItem('token', ...)`
3. Remove all `Authorization: Bearer ${token}` headers
4. Add `credentials: 'include'` to all fetch calls
5. Add `axios.defaults.withCredentials = true`

### Backend Changes

1. Middleware now only accepts cookies (no Bearer tokens)
2. Login sets cookies instead of returning tokens
3. Logout clears cookies and revokes refresh tokens

---

## 🆘 Troubleshooting

### Issue: Cookies not being set

- **Check:** Is `credentials: 'include'` set on frontend?
- **Check:** Is CORS configured with `credentials: true`?
- **Check:** Are frontend and backend on same domain (or CORS whitelist)?

### Issue: 401 on every request

- **Check:** Browser DevTools > Application > Cookies
- **Check:** Are cookies being sent in request headers?
- **Check:** Is `NODE_ENV=production` set correctly?

### Issue: Refresh not working

- **Check:** Is refresh token in database?
- **Check:** Is refresh token expired?
- **Check:** Console logs in `/api/auth/refresh` endpoint

---

## 📚 Additional Resources

- [OWASP JWT Best Practices](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html)
- [RFC 6749: OAuth 2.0](https://tools.ietf.org/html/rfc6749)
- [HttpOnly Cookie Security](https://owasp.org/www-community/HttpOnly)

---

## 🎉 Summary

Your JWT authentication system is now:

- ✅ **Secure** - HttpOnly cookies, token rotation, short lifetimes
- ✅ **Industry Standard** - Follows OWASP best practices
- ✅ **Production Ready** - Proper error handling, logging, cleanup
- ✅ **User Friendly** - Automatic refresh, seamless UX
- ✅ **Maintainable** - Clean code, well-documented

**You're good to go! 🚀**
