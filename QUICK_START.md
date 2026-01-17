# 🔐 JWT Auth - Quick Reference

## ✅ PRODUCTION READY - All Requirements Met

### 🎯 What Was Fixed

1. ✅ Middleware now **ONLY accepts HttpOnly cookies** (removed Bearer token support)
2. ✅ Admin frontend updated to use **cookies instead of localStorage**
3. ✅ Website frontend configured with **axios.defaults.withCredentials**
4. ✅ CORS configured to support credentials
5. ✅ Automatic token refresh implemented in both frontends

---

## 📦 Files Modified

### Backend

- `backend/middleware/authMiddleware.js` - Now cookie-only
- `backend/server.js` - CORS with credentials
- `backend/.env.example` - Production config template

### Frontend - Admin

- `adminFrontend/src/utils/api.js` - Added withCredentials
- `adminFrontend/src/utils/fetchWithAuth.js` - Cookie-based auth
- `adminFrontend/src/context/AuthContext.jsx` - Removed localStorage
- `adminFrontend/src/components/account/Account.jsx` - Cookie auth

### Frontend - Website

- `Website/src/utils/api.js` - Added withCredentials
- `Website/src/utils/authFetch.js` - Already using cookies ✅

---

## 🚀 Quick Start

### 1. Backend Setup

```bash
cd backend
npm install

# Create .env file
cp .env.example .env
# Edit .env and set:
# - JWT_SECRET (min 32 chars)
# - MONGO_URI
# - NODE_ENV=production (for production)

npm start
```

### 2. Frontend Setup

```bash
# Admin Frontend
cd adminFrontend
npm install
# Create .env with VITE_API_BASE_URL
npm run dev

# Website Frontend
cd Website
npm install
# Create .env with VITE_API_BASE_URL
npm run dev
```

---

## 🔑 Key Environment Variables

### Backend (.env)

```env
JWT_SECRET=your-32-char-secret-here
ACCESS_TOKEN_TTL_MINUTES=15
REFRESH_TOKEN_TTL_DAYS=7
NODE_ENV=production
CORS_ORIGINS=https://yourdomain.com,https://admin.yourdomain.com
```

### Frontend (.env)

```env
VITE_API_BASE_URL=https://api.yourdomain.com
```

---

## 🛡️ Security Checklist

✅ HttpOnly cookies (not accessible to JS)
✅ Secure flag (HTTPS only)
✅ SameSite strict (CSRF protection)
✅ Short access token life (15 min)
✅ Refresh token rotation
✅ Database token storage (hashed)
✅ Automatic token refresh
✅ Proper logout (revoke tokens)
✅ No localStorage/sessionStorage

---

## 📊 Token Flow

```
Login → Server sets cookies → API calls auto-send cookies
→ Access token expires (15 min) → 401 → Auto refresh
→ New tokens issued → Request retried → Success
```

---

## 🧪 Test It

### 1. Login

```bash
curl -c cookies.txt -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone": "+1234567890", "password": "test123"}'
```

### 2. Access Protected Route

```bash
curl -b cookies.txt http://localhost:5000/api/auth/me
```

### 3. Logout

```bash
curl -b cookies.txt -X POST http://localhost:5000/api/auth/logout
```

---

## 🆘 Common Issues

### Cookies not being set?

- Check CORS origins match your frontend URL
- Ensure `credentials: 'include'` in frontend
- Check browser DevTools > Application > Cookies

### 401 on all requests?

- Verify cookies are being sent (Network tab)
- Check `NODE_ENV` matches cookie `secure` setting
- Localhost needs `secure: false`, production needs `secure: true`

---

## 📚 Documentation

See [JWT_AUTHENTICATION_GUIDE.md](./JWT_AUTHENTICATION_GUIDE.md) for full documentation.

---

## ✨ What Makes This Production Ready?

1. **Secure** - HttpOnly cookies protect against XSS
2. **Resilient** - Auto token refresh for seamless UX
3. **Auditable** - IP tracking, token history
4. **Scalable** - Database-backed token store
5. **Maintainable** - Clean code, well-documented
6. **Compliant** - Follows OWASP best practices

**Your authentication is now industry-standard! 🎉**
