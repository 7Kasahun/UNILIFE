# UniLife Ethiopia — Administrator Setup & Security Guide

## 1. Security Architecture: Why Public Admin Signup Is Disabled

In UniLife Ethiopia, ordinary students register through `/register`.
Under no circumstances can an ordinary student become an administrator by editing URL parameters, crafting HTTP payloads, or modifying frontend state.

Administrators are maintained in a completely separate database table:
- Students: `users` table
- Administrators: `admin_users` table
- Roles: `admin_roles`
- Permissions: `admin_permissions`

---

## 2. Setting Up the Initial Super Administrator

The initial Super Administrator must be bootstrapped via the secure command-line tool.

### Interactive Setup
Run the following in the `backend` directory:

```bash
cd backend
npm run setup-admin
```

The script will securely prompt for:
1. Super Admin Full Name (Default: `Super Administrator`)
2. Admin Username (Default: `admin`)
3. Admin Email (Default: `admin@unilife.et`)
4. Admin Password (minimum 8 characters, hashed with bcrypt 10 salt rounds)

### Non-Interactive CLI Setup (Automated Deployments)

```bash
cd backend
node src/scripts/setup-admin.js --name "UniLife Super Admin" --username "admin" --email "admin@unilife.et" --password "YourStrongPassword2026!"
```

---

## 3. Administrator Roles & Permissions

1. **Super Admin**:
   - Access to all systems
   - Ability to create and invite other administrators (`admins.manage`)
   - Platform analytics (`analytics.view`)
   - Student account moderation & suspension (`users.manage`)
   - Voluntary donation receipt verification (`donations.verify`)
   - System announcements broadcast (`announcements.manage`)

2. **Admin**:
   - Student management
   - Donation verification
   - Announcements
   - View analytics

---

## 4. Administrator Activity Audit Logging

Every administrative action is immutably recorded in `admin_activity_logs`:
- Administrator ID & username
- Action key (e.g. `verify_donation`, `suspend_student`, `create_announcement`)
- Target entity and entity ID
- Reason or details
- IP address and timestamp
