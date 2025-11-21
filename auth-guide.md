# NestJS JWT Authentication: The Complete Guide

This guide explains **how** JWT authentication works in NestJS, not just what to copy-paste. You'll understand the patterns, the framework abstractions, and why each piece exists.

---

## The Mental Model: Airport Security

Before diving into code, understand the two authentication flows:

| Flow       | Analogy          | What happens                                          |
| ---------- | ---------------- | ----------------------------------------------------- |
| **Login**  | Check-in counter | Show ID (username/password) → Get boarding pass (JWT) |
| **Access** | Security gate    | Show boarding pass (JWT) → Enter if valid             |

These are **separate concerns** handled by different "Strategies".

---

## Part 1: Understanding the Framework

### Why Passport?

NestJS doesn't have built-in authentication. Instead, it integrates with **Passport.js**, a battle-tested Node.js authentication library. But Passport uses callbacks, while NestJS uses classes and decorators. The `@nestjs/passport` package bridges this gap.

### The Key Abstractions

#### 1. `PassportStrategy` - The Contract

When you write:

```typescript
export class LocalStrategy extends PassportStrategy(Strategy) {
```

You're NOT inheriting from a normal class. `PassportStrategy()` is a **mixin** that wraps a Passport strategy and says:

> "You MUST implement a method called `validate()`. I will call it during authentication."

Think of it like implementing an interface:

```typescript
// Conceptually what PassportStrategy expects:
interface StrategyContract {
  validate(...args): any; // YOU must write this
}
```

- The name `validate` is **required** - naming it `checkUser()` won't work
- What `validate()` receives depends on the strategy type (more on this below)
- Whatever `validate()` returns → gets attached to `req.user`
- If `validate()` throws → authentication fails

#### 2. `AuthGuard` - The Trigger

Guards in NestJS decide if a request can proceed. `AuthGuard('strategy-name')` is special:

```typescript
@UseGuards(AuthGuard('local'))  // Triggers LocalStrategy
@UseGuards(AuthGuard('jwt'))    // Triggers JwtStrategy
```

When a guard is triggered, it:

1. Finds the strategy by name
2. Extracts credentials (from body, headers, etc.)
3. Calls YOUR `validate()` method
4. Attaches the result to `req.user`
5. Allows or denies the request

**Without a guard, your strategy never runs!**

---

## Part 2: Dependencies

```bash
npm install @nestjs/jwt @nestjs/passport passport passport-jwt passport-local bcrypt
npm install --save-dev @types/passport-jwt @types/passport-local @types/bcrypt
```

| Package            | Purpose                                    |
| ------------------ | ------------------------------------------ |
| `passport`         | Core authentication engine                 |
| `@nestjs/passport` | NestJS adapter for Passport                |
| `passport-local`   | Strategy for username/password login       |
| `passport-jwt`     | Strategy for JWT token verification        |
| `@nestjs/jwt`      | Utility to create/sign tokens              |
| `bcrypt`           | Password hashing (never store plain text!) |

---

## Part 3: The Login Flow

**Goal:** User sends credentials → We verify → We return a JWT

### The Complete Chain

```
POST /auth/login { username, password }
            ↓
    @UseGuards(AuthGuard('local'))     ← Guard intercepts BEFORE controller
            ↓
    Guard finds LocalStrategy
            ↓
    Passport extracts username/password from request body
            ↓
    Passport calls YOUR LocalStrategy.validate(username, password)
            ↓
    You call authService.validateUser() to check DB + bcrypt
            ↓
    You return the user (or throw UnauthorizedException)
            ↓
    Passport attaches returned user to req.user
            ↓
    Controller runs: login(@Request() req) receives req.user
            ↓
    authService.login(req.user) signs and returns JWT
```

### Step 1: AuthModule Setup

```typescript
// src/auth/auth.module.ts
@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'YOUR_SECRET_KEY',
      signOptions: { expiresIn: '60s' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy], // ← Strategies must be here!
})
export class AuthModule {}
```

**Why register strategies as providers?** NestJS needs to instantiate them and inject dependencies (like AuthService).

### Step 2: AuthService

This service does two distinct jobs:

```typescript
// src/auth/auth.service.ts
@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  // JOB 1: Validate credentials (called during login)
  async validateUser(
    userName: string,
    pass: string,
  ): Promise<SafeUserDto | null> {
    const user = await this.usersService.findByUsername(userName);
    if (!user) return null;

    const isValidPassword = await bcrypt.compare(pass, user.password);
    if (!isValidPassword) return null;

    // Strip password before returning - never expose it!
    const { password: _, ...safeUser } = user;
    return safeUser;
  }

  // JOB 2: Sign the JWT (called after validation succeeds)
  login(user: SafeUserDto) {
    const payload: JwtPayload = { username: user.userName, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
```

**Key insight:** `login()` does NOT fetch the user - it receives an already-validated user from the controller.

### Step 3: LocalStrategy

```typescript
// src/auth/strategies/local.strategy.ts
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super(); // Uses defaults: looks for 'username' and 'password' in body
  }

  // Passport calls this with credentials extracted from request body
  async validate(username: string, password: string) {
    const user = await this.authService.validateUser(username, password);
    if (!user) throw new UnauthorizedException();
    return user; // ← This becomes req.user
  }
}
```

**What `validate()` receives:** For LocalStrategy, Passport extracts `username` and `password` from the request body and passes them as arguments.

### Step 4: Login Controller

```typescript
// src/auth/auth.controller.ts
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public() // ← Bypass global JWT guard (explained in Part 5)
  @UseGuards(AuthGuard('local')) // ← Triggers LocalStrategy
  @Post('login')
  login(@Request() req) {
    // req.user contains whatever LocalStrategy.validate() returned
    return this.authService.login(req.user);
  }
}
```

**Why `req.user`?** The guard runs BEFORE your controller. By the time `login()` executes, the user is already validated and attached to `req.user`.

---

## Part 4: The Access Flow

**Goal:** User sends JWT → We verify → We allow access

### The Complete Chain

```
GET /protected-route
Headers: { Authorization: "Bearer <token>" }
            ↓
    @UseGuards(AuthGuard('jwt'))  OR  Global JwtAuthGuard
            ↓
    Guard finds JwtStrategy
            ↓
    Passport extracts token from Authorization header
            ↓
    Passport verifies signature using secretOrKey
            ↓
    If invalid/expired → 401 Unauthorized (your code never runs)
            ↓
    If valid → Passport decodes token into payload
            ↓
    Passport calls YOUR JwtStrategy.validate(payload)
            ↓
    You return whatever shape you want for req.user
            ↓
    Controller runs with req.user available
```

### Key Difference from LocalStrategy

|                         | LocalStrategy                 | JwtStrategy                 |
| ----------------------- | ----------------------------- | --------------------------- |
| **Input**               | username + password from body | Token from header           |
| **Who validates?**      | YOU check DB + bcrypt         | PASSPORT verifies signature |
| **validate() receives** | Raw credentials               | Already-decoded payload     |
| **When used**           | Login only                    | Every protected request     |

### JwtStrategy

```typescript
// src/auth/strategies/jwt.strategy.ts
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'YOUR_SECRET_KEY',
    });
  }

  // This ONLY runs if Passport already verified the token!
  validate(payload: JwtPayload) {
    // payload = decoded token: { sub: "uuid", username: "john", iat: ..., exp: ... }
    return { userId: payload.sub, username: payload.username };
  }
}
```

**What `validate()` receives:** The decoded JWT payload. Passport already verified the signature - you're just shaping the data for `req.user`.

### Type Safety with JwtPayload

Define the payload shape once, use everywhere:

```typescript
// src/auth/interfaces/jwt-payload.interface.ts
export interface JwtPayload {
  sub: string;
  username: string;
}
```

---

## Part 5: Global Guard with Public Bypass

**Problem:** If we protect the entire app with JWT, how do users reach `/auth/login` without a token?

**Solution:** A global guard that checks for a `@Public()` decorator.

### Step 1: Create the Decorator

```typescript
// src/auth/decorators/public.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
```

`SetMetadata` attaches data to a route that can be read later by guards.

### Step 2: Smart JwtAuthGuard

```typescript
// src/auth/jwt-auth.guard.ts
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // Check if route has @Public() decorator
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(), // Check method first
      context.getClass(), // Then check class
    ]);

    // If public, skip JWT verification
    if (isPublic) return true;

    // Otherwise, run normal JWT check
    return super.canActivate(context);
  }
}
```

**What's `Reflector`?** A NestJS utility that reads metadata attached by decorators. We use it to check if a route was marked with `@Public()`.

### Step 3: Register Globally

```typescript
// src/app.module.ts
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/jwt-auth.guard';

@Module({
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
```

**Now:** All routes require JWT by default. Mark exceptions with `@Public()`.

---

## Part 6: Utility Patterns

### SafeUserDto - Never Expose Passwords

```typescript
// src/users/dto/safe-user.dto.ts
export type SafeUserDto = Omit<User, 'password'>;
```

Use this type whenever returning user data.

### Stripping Password with Destructuring

```typescript
const { password: _, ...safeUser } = user;
return safeUser;
```

The `_` is a convention for "discard this". Configure ESLint to allow it:

```javascript
// eslint.config.mjs
'@typescript-eslint/no-unused-vars': ['error', {
  argsIgnorePattern: '^_',
  varsIgnorePattern: '^_'
}]
```

---

## Quick Reference

### Files You Need

```
src/auth/
├── auth.module.ts           # Wire everything together
├── auth.service.ts          # validateUser() + login()
├── auth.controller.ts       # Login endpoint
├── jwt-auth.guard.ts        # Global guard with @Public() support
├── strategies/
│   ├── local.strategy.ts    # Username/password validation
│   └── jwt.strategy.ts      # Token verification
├── decorators/
│   └── public.decorator.ts  # @Public() bypass
└── interfaces/
    └── jwt-payload.interface.ts  # Type safety
```

### Checklist

- [ ] Install dependencies
- [ ] Create AuthModule with JwtModule.register()
- [ ] Add strategies to providers array
- [ ] Create LocalStrategy with validate()
- [ ] Create JwtStrategy with validate()
- [ ] Create AuthService with validateUser() and login()
- [ ] Create login endpoint with @UseGuards(AuthGuard('local'))
- [ ] Create JwtAuthGuard with Reflector
- [ ] Create @Public() decorator
- [ ] Register JwtAuthGuard globally with APP_GUARD
- [ ] Mark login route as @Public()
