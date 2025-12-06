# 🔒 VIERKORKEN SECURITY IMPLEMENTATION GUIDE

## ✅ Security Features Already Implemented

### 1. Automatic Protection (Already Active)

- **SQL Injection Protection**: ✅ Prisma ORM automatically prevents SQL injection
- **XSS Protection**: ✅ React + Next.js automatically escapes all user input
- **CSRF Protection**: ✅ NextAuth provides automatic CSRF protection
- **Security Headers**: ✅ Middleware applies headers to ALL routes automatically
- **Clickjacking Protection**: ✅ X-Frame-Options: DENY
- **MIME Sniffing Protection**: ✅ X-Content-Type-Options: nosniff
- **Content Security Policy**: ✅ Restricts resource loading

### 2. Security Library (`src/lib/security.ts`)

Provides centralized security functions:

```typescript
import {
  sanitizeString,
  isValidEmail,
  isValidPhone,
  isValidNumber,
  sanitizeFilename,
  checkRateLimit,
  requireAuth,
  requireAdmin,
  validateReviewInput,
  validateRegistrationInput,
  validateAddressInput,
} from '@/lib/security';
```

## 🛡️ How to Secure Your API Routes

### Pattern 1: Public Route with Rate Limiting

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { applyRateLimit, sanitizeString } from '@/lib/security';

export async function GET(req: NextRequest) {
  // Apply rate limiting: 100 requests per minute
  const rateLimitResponse = await applyRateLimit(req, 100, 60000);
  if (rateLimitResponse) return rateLimitResponse;

  // Your logic here...
  const query = req.nextUrl.searchParams.get('q');
  const sanitized = sanitizeString(query || '', 200);

  // ...
}
```

### Pattern 2: Authenticated Route

```typescript
import { requireAuth, applyRateLimit } from '@/lib/security';

export async function POST(req: NextRequest) {
  // Rate limit first
  const rateLimitResponse = await applyRateLimit(req, 50, 60000);
  if (rateLimitResponse) return rateLimitResponse;

  // Then check authentication
  const session = await requireAuth(req);
  if (session instanceof NextResponse) return session;

  // User is authenticated, proceed...
}
```

### Pattern 3: Admin-Only Route

```typescript
import { requireAdmin, applyRateLimit } from '@/lib/security';

export async function DELETE(req: NextRequest) {
  // Rate limit
  const rateLimitResponse = await applyRateLimit(req, 20, 60000);
  if (rateLimitResponse) return rateLimitResponse;

  // Check admin access
  const session = await requireAdmin(req);
  if (session instanceof NextResponse) return session;

  // User is admin, proceed...
}
```

### Pattern 4: Route with Input Validation

```typescript
import { validateReviewInput, requireAuth } from '@/lib/security';

export async function POST(req: NextRequest) {
  const session = await requireAuth(req);
  if (session instanceof NextResponse) return session;

  const body = await req.json();

  // Validate input
  const { valid, errors } = validateReviewInput(body);
  if (!valid) {
    return NextResponse.json(
      { success: false, errors },
      { status: 400 }
    );
  }

  // Input is valid, proceed...
}
```

### Pattern 5: File Upload Route

```typescript
import {
  sanitizeFilename,
  isValidFileExtension,
  isValidFileSize,
  requireAuth
} from '@/lib/security';

export async function POST(req: NextRequest) {
  const session = await requireAuth(req);
  if (session instanceof NextResponse) return session;

  const formData = await req.formData();
  const file = formData.get('file') as File;

  // Validate file
  if (!file) {
    return NextResponse.json(
      { error: 'No file provided' },
      { status: 400 }
    );
  }

  // Check file extension
  const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp'];
  if (!isValidFileExtension(file.name, allowedExtensions)) {
    return NextResponse.json(
      { error: 'Invalid file type. Only JPG, PNG, WEBP allowed' },
      { status: 400 }
    );
  }

  // Check file size (max 5MB)
  if (!isValidFileSize(file.size, 5)) {
    return NextResponse.json(
      { error: 'File too large. Max 5MB' },
      { status: 400 }
    );
  }

  // Sanitize filename
  const safeFilename = sanitizeFilename(file.name);

  // Proceed with upload...
}
```

## 🚨 Critical Security Checklist

### For ALL Admin Routes (`/api/admin/**`)

- [ ] Use `requireAdmin()` helper
- [ ] Add rate limiting (lower limits for admin routes)
- [ ] Validate all input data
- [ ] Log security-sensitive actions
- [ ] Never expose internal IDs in responses

### For ALL User Input Routes

- [ ] Validate all input fields
- [ ] Sanitize strings with `sanitizeString()`
- [ ] Check email format with `isValidEmail()`
- [ ] Limit string lengths
- [ ] Validate numbers are within expected ranges

### For File Upload Routes

- [ ] Validate file extension (whitelist only)
- [ ] Validate file size
- [ ] Sanitize filename
- [ ] Check MIME type
- [ ] Scan for viruses (if possible)
- [ ] Store in separate domain/bucket

### For Database Operations

- [ ] ALWAYS use Prisma (no raw SQL)
- [ ] Use parameterized queries (Prisma does this)
- [ ] Validate IDs before lookups
- [ ] Check ownership before updates/deletes
- [ ] Never trust client-provided IDs

## 📊 Route-Specific Security Requirements

### High Priority (Implement Immediately)

| Route | Security Requirements |
|-------|----------------------|
| `/api/admin/**` | `requireAdmin()`, rate limit, input validation |
| `/api/reviews` | `requireAuth()` for POST, validate review input |
| `/api/auth/register` | Validate registration input, rate limit heavily |
| `/api/admin/upload` | File validation, admin only, virus scan |
| `/api/webhooks/stripe` | Verify Stripe signature, rate limit |
| `/api/orders/**` | `requireAuth()`, validate order ownership |

### Medium Priority

| Route | Security Requirements |
|-------|----------------------|
| `/api/user/**` | `requireAuth()`, validate user owns resource |
| `/api/events/**` | Rate limit, validate input |
| `/api/wines/**` | Rate limit GET, validate POST input |

### Low Priority (Already Secure)

| Route | Why Secure |
|-------|-----------|
| `/api/klara/**` | Read-only, external API handles security |
| `/api/cart` | Client-side only, no sensitive data |

## 🔐 Environment Variables Security

### Never Expose These in Client

```env
# ❌ NEVER prefix with NEXT_PUBLIC_
DATABASE_URL
NEXTAUTH_SECRET
JWT_SECRET
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
KLARA_API_SECRET
S3_SECRET_KEY
SMTP_PASSWORD
```

### Safe to Expose (NEXT_PUBLIC_)

```env
# ✅ Safe to expose
NEXT_PUBLIC_APP_URL
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
NEXT_PUBLIC_SITE_NAME
```

## 🚀 Production Deployment Security

### Before Going Live

1. **Generate New Secrets**
   ```bash
   openssl rand -base64 64  # For NEXTAUTH_SECRET
   openssl rand -base64 64  # For JWT_SECRET
   ```

2. **Enable HTTPS Only**
   - Force HTTPS in production
   - Set HSTS header (already in middleware)

3. **Configure CSP for Production**
   - Review Content-Security-Policy in `middleware.ts`
   - Add your CDN domains
   - Remove `unsafe-eval` and `unsafe-inline` if possible

4. **Set Up Monitoring**
   - Add Sentry for error tracking
   - Monitor rate limit violations
   - Set up alerts for security events

5. **Database Security**
   - Use strong database passwords
   - Limit database access to app server only
   - Enable SSL for database connections
   - Regular backups

6. **API Keys**
   - Rotate Stripe keys to live mode
   - Generate new webhook secrets
   - Use environment-specific KLARA keys

## 🐛 Common Security Mistakes to Avoid

### ❌ DON'T DO THIS

```typescript
// ❌ No authentication check
export async function DELETE(req: NextRequest, { params }: any) {
  const id = params.id;
  await prisma.user.delete({ where: { id } });  // DANGEROUS!
}

// ❌ No input validation
export async function POST(req: NextRequest) {
  const body = await req.json();
  await prisma.review.create({ data: body });  // DANGEROUS!
}

// ❌ SQL injection possible
const query = \`SELECT * FROM users WHERE email = '\${email}'\`;  // NEVER!

// ❌ Exposing sensitive data
return NextResponse.json({
  user: {
    password: user.password,  // NEVER!
    email: user.email
  }
});
```

### ✅ DO THIS INSTEAD

```typescript
// ✅ With authentication
export async function DELETE(req: NextRequest, { params }: any) {
  const session = await requireAdmin(req);
  if (session instanceof NextResponse) return session;

  const { id } = await params;
  await prisma.user.delete({ where: { id } });
}

// ✅ With input validation
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { valid, errors } = validateReviewInput(body);
  if (!valid) {
    return NextResponse.json({ errors }, { status: 400 });
  }
  await prisma.review.create({ data: body });
}

// ✅ Using Prisma (prevents SQL injection)
const user = await prisma.user.findUnique({
  where: { email }
});

// ✅ Only expose necessary data
return NextResponse.json({
  user: {
    id: user.id,
    email: user.email,
    firstName: user.firstName
    // password field automatically excluded
  }
});
```

## 📚 Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security Best Practices](https://nextjs.org/docs/app/building-your-application/security)
- [Prisma Security Guide](https://www.prisma.io/docs/guides/database/advanced-database-security)
- [NextAuth Security](https://next-auth.js.org/configuration/options#security)

## 🎯 Implementation Priority

1. **Week 1**: Secure all `/api/admin/**` routes
2. **Week 2**: Add input validation to all POST/PUT/PATCH routes
3. **Week 3**: Implement rate limiting on public routes
4. **Week 4**: File upload security + comprehensive testing

---

**Remember**: Security is an ongoing process. Regularly review your code,
update dependencies, and stay informed about new vulnerabilities.
