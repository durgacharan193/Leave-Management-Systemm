# 📚 LeaveFlow API Documentation

**Base URL:** `http://localhost:5000/api`

All protected endpoints require the `Authorization` header:
```
Authorization: Bearer <jwt_token>
```

---

## 🔐 Authentication

### Register
```
POST /api/auth/register
```
**Access:** Public

**Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "department": "Engineering"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": {
      "_id": "...",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "employee",
      "department": "Engineering",
      "leaveBalance": { "casual": 12, "sick": 10, "paid": 15 }
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

---

### Login
```
POST /api/auth/login
```
**Access:** Public

**Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { ... },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

---

### Get Current User
```
GET /api/auth/me
```
**Access:** Private (All roles)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "...",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "employee",
      "department": "Engineering",
      "manager": { "_id": "...", "name": "Sarah Johnson", "email": "..." },
      "leaveBalance": { "casual": 12, "sick": 10, "paid": 15 },
      "isActive": true
    }
  }
}
```

---

### Update Password
```
PUT /api/auth/password
```
**Access:** Private (All roles)

**Body:**
```json
{
  "currentPassword": "password123",
  "newPassword": "newpassword456"
}
```

---

## 📋 Leave Management

### Apply for Leave
```
POST /api/leaves
```
**Access:** Private (Employee, Manager)

**Body:**
```json
{
  "leaveType": "casual",
  "startDate": "2024-03-20",
  "endDate": "2024-03-22",
  "reason": "Family vacation"
}
```

**Validations:**
- `leaveType`: must be `casual`, `sick`, or `paid`
- `endDate` must be ≥ `startDate`
- Sufficient leave balance required
- No overlapping leave requests

**Response (201):**
```json
{
  "success": true,
  "message": "Leave application submitted successfully",
  "data": {
    "leave": {
      "_id": "...",
      "employee": "...",
      "leaveType": "casual",
      "startDate": "2024-03-20T00:00:00.000Z",
      "endDate": "2024-03-22T00:00:00.000Z",
      "reason": "Family vacation",
      "status": "pending",
      "duration": 3
    }
  }
}
```

---

### Get My Leaves
```
GET /api/leaves/my?page=1&limit=10&status=pending&leaveType=casual
```
**Access:** Private (All roles)

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| page | number | 1 | Page number |
| limit | number | 10 | Items per page |
| status | string | — | Filter: pending/approved/rejected/cancelled |
| leaveType | string | — | Filter: casual/sick/paid |
| sort | string | -createdAt | Sort field |

**Response (200):**
```json
{
  "success": true,
  "data": {
    "leaves": [ ... ],
    "pagination": {
      "total": 25,
      "page": 1,
      "limit": 10,
      "pages": 3
    }
  }
}
```

---

### Cancel Leave
```
PATCH /api/leaves/:id/cancel
```
**Access:** Private (Own leave only)

**Rules:**
- Only `pending` leaves can be cancelled
- Can only cancel your own leaves

---

### Get Team Leaves (Manager)
```
GET /api/leaves/team?page=1&limit=10&status=pending
```
**Access:** Private (Manager)

Returns leaves from employees assigned to this manager.

---

### Review Leave
```
PATCH /api/leaves/:id/review
```
**Access:** Private (Manager, Admin)

**Body:**
```json
{
  "status": "approved",
  "reviewComment": "Enjoy your vacation!"
}
```

**Rules:**
- `status` must be `approved` or `rejected`
- Only `pending` leaves can be reviewed
- Managers can only review their team's leaves
- Approved leaves deduct from employee's balance

---

### Get All Leaves (Admin)
```
GET /api/leaves?page=1&limit=10&status=pending&leaveType=casual&employee=userId
```
**Access:** Private (Admin)

---

### Get Leave Statistics
```
GET /api/leaves/stats
```
**Access:** Private (All roles)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "statusStats": {
      "total": 45,
      "pending": 8,
      "approved": 30,
      "rejected": 5,
      "cancelled": 2
    },
    "typeStats": {
      "casual": 20,
      "sick": 10,
      "paid": 15
    },
    "monthlyTrend": [
      { "_id": { "year": 2024, "month": 1 }, "count": 12 },
      { "_id": { "year": 2024, "month": 2 }, "count": 8 }
    ]
  }
}
```

**Note:** Stats are scoped by role:
- **Admin** → all leave data
- **Manager** → team data only
- **Employee** → own data only

---

## 👥 User Management (Admin Only)

### Get All Users
```
GET /api/users?page=1&limit=10&role=employee&search=john&department=Engineering
```
**Access:** Private (Admin)

---

### Get Single User
```
GET /api/users/:id
```
**Access:** Private (Admin)

Returns user details plus leave statistics.

---

### Create User
```
POST /api/users
```
**Access:** Private (Admin)

**Body:**
```json
{
  "name": "New Employee",
  "email": "new@company.com",
  "password": "password123",
  "role": "employee",
  "department": "Engineering",
  "manager": "managerId"
}
```

---

### Update User
```
PUT /api/users/:id
```
**Access:** Private (Admin)

**Body (all fields optional):**
```json
{
  "name": "Updated Name",
  "role": "manager",
  "department": "Marketing",
  "manager": "managerId",
  "isActive": true,
  "leaveBalance": { "casual": 10, "sick": 8, "paid": 12 }
}
```

---

### Deactivate User
```
DELETE /api/users/:id
```
**Access:** Private (Admin)

Soft-deletes by setting `isActive: false`. Cannot deactivate yourself.

---

### Get All Managers
```
GET /api/users/managers
```
**Access:** Private (Admin)

Returns list of active managers for assignment dropdowns.

---

## 🏥 Health Check
```
GET /api/health
```
**Access:** Public

**Response:**
```json
{
  "success": true,
  "message": "Leave Management System API is running",
  "timestamp": "2024-03-15T10:30:00.000Z",
  "environment": "development"
}
```

---

## ❌ Error Response Format

All errors follow this structure:
```json
{
  "success": false,
  "message": "Human-readable error description",
  "errors": [
    { "field": "email", "message": "Please provide a valid email" }
  ]
}
```

### Common Status Codes
| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request / Validation Error |
| 401 | Unauthorized (invalid/missing token) |
| 403 | Forbidden (insufficient role) |
| 404 | Not Found |
| 429 | Rate Limited |
| 500 | Internal Server Error |
