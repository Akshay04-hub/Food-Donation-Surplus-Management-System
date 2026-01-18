# NGO Approval System - Flow Diagram

## Complete Flow Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                    NGO APPROVAL SYSTEM FLOW                         │
└─────────────────────────────────────────────────────────────────────┘

                          ┌─────────────────┐
                          │  NGO Registers  │
                          └────────┬────────┘
                                   │
                    ┌──────────────▼──────────────┐
                    │  Backend Creates NGO with  │
                    │   Status: PENDING          │
                    └──────────────┬──────────────┘
                                   │
            ┌──────────────────────┼──────────────────────┐
            │                      │                      │
      ┌─────▼─────┐         ┌─────▼─────┐       ┌──────▼──────┐
      │Email Sent │         │Notification       │   Database  │
      │   to All  │         │  Created for      │    Updated  │
      │  Admins   │         │  All Admins       │   (PENDING) │
      └───────────┘         └───────────┘       └─────────────┘
                                   │
                    ┌──────────────▼──────────────┐
                    │  Admin Opens Admin          │
                    │  Dashboard -> NGOs Tab      │
                    └──────────────┬──────────────┘
                                   │
                    ┌──────────────▼──────────────┐
                    │  Admin Views:               │
                    │  • All NGOs or              │
                    │  • ⏳ Pending Status or     │
                    │  • ✓ Approved Status        │ 
                    └──────────────┬──────────────┘
                                   │
                    ┌──────────────▼──────────────┐
                    │  Pending Alert Banner      │
                    │  Shows Pending Count       │
                    └──────────────┬──────────────┘
                                   │
                ┌──────────────────┼──────────────────┐
                │                  │                  │
         ┌──────▼──────┐    ┌─────▼────┐    ┌──────▼──────┐
         │ Admin Clicks│    │   Admin   │    │   Admin     │
         │  "Approve"  │    │  Reviews  │    │  Clicks     │
         │   Button    │    │   Details │    │  "Reject"   │
         └──────┬──────┘    └───────────┘    └──────┬──────┘
                │                                   │
                │                           ┌───────▼────────┐
                │                           │  Reason Prompt │
                │                           │    (Optional)  │
                │                           └───────┬────────┘
                │                                   │
        ┌───────▼─────────┐            ┌────────────▼──────┐
        │ Backend Updates │            │ Backend Processes │
        │ Status APPROVED │            │ Rejection Reason  │
        │ Sets verified_by│            │ Status REJECTED   │
        │ Sets verified   │            | Records rejection │
        │    date         │            │      date         │
        └───────┬─────────┘            └────────┬──────────┘
                │                               │
        ┌───────▼────────┐            ┌────────▼──────┐
        │ Sends Approval │            │ Sends Rejection
        │  Email to NGO  │            │ Email with     │
        │                │            │ Reason         │
        └───────┬────────┘            └────────┬──────┘
                │                              │
        ┌───────▼────────┐            ┌────────▼──────┐
        │  Creates       │            │  Creates      │
        │  Notification  │            │  Notification │
        │ ORGANIZATION   │            │ ORGANIZATION  │
        │  _APPROVED     │            │  _REJECTED    │
        └───────┬────────┘            └────────┬──────┘
                │                              │
        ┌───────▼────────────────────────────▼──────┐
        │  Frontend Updates Table:                  │
        │  • Status Badge Changes Color             │
        │  • Buttons Removed (for approved)         │
        │  • Row Highlights Updated                 │
        │  • Count Updated in Filter Button         │
        └──────────────────────────────────────────┘
```

---

## Admin Dashboard View - NGO Approval Section

```
┌────────────────────────────────────────────────────────────┐
│          🏢 NGO MANAGEMENT ADMIN DASHBOARD                │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  NGO Management (45)                                       │
│                                                            │
│  [All NGOs (45)] [⏳ Pending (3)] [✓ Approved (42)]      │
│                                                            │
│  ⚠️ Pending NGO Approvals!                               │
│  You have 3 NGO registrations awaiting your approval.     │
│                                                            │
├────────────────────────────────────────────────────────────┤
│ Organization Name│Email│Location│Type│Date│Status│Actions │
├────────────────────────────────────────────────────────────┤
│🟡 Hope Foundation│help@│Mumbai, │NGO │Dec │🟡    │[✓ Appr]│
│  NGO             │hope │MH      │    │15  │PENDING│[✕ Reject│
│────────────────────────────────────────────────────────────│
│🟡 Feed the Needy │feed@│Delhi   │NGO │Dec │🟡    │[✓ Appr]│
│  Foundation      │need │UP      │    │15  │PENDING│[✕ Reject│
│────────────────────────────────────────────────────────────│
│🟡 Care & Share  │care@│Bangalore│NGO │Dec │🟡    │[✓ Appr]│
│                  │share│KA      │    │15  │PENDING│[✕ Reject│
│────────────────────────────────────────────────────────────│
│✓ Good Samaritans │good@│Chennai │NGO │Dec │🟢    │✓ Verified
│                  │sama │TN      │    │14  │APPROVED          │
└────────────────────────────────────────────────────────────┘
```

---

## State Management Flow

```
INITIAL STATE
│
├─ activeTab: 'ngos'
├─ ngos: [ { name, email, verification_status, ... }, ... ]
├─ ngoFilter: 'all' | 'pending' | 'approved'
└─ actionLoading: null | ngoId

                    ▼

USER CLICKS FILTER (e.g., "Pending")
│
├─ setNgoFilter('pending')
├─ Table filters: ngos.filter(n => status === 'PENDING')
└─ Displays only pending NGOs

                    ▼

USER CLICKS APPROVE/REJECT
│
├─ setActionLoading(ngoId)
├─ API Call: PUT /api/organizations/:id/approve
├─ Backend processes and returns updated organization
├─ Frontend updates ngos array
├─ setActionLoading(null)
└─ UI refreshes automatically

                    ▼

TABLE RENDERS WITH UPDATED DATA
│
├─ Color badges update
├─ Status changes
├─ Action buttons appear/disappear
├─ Pending count updates
└─ Alert banner shown/hidden based on pending count
```

---

## API Request/Response Cycle

```
┌──────────────────────────────────────────────────────────┐
│                    API APPROVE FLOW                      │
└──────────────────────────────────────────────────────────┘

Frontend:
  1. User clicks "✓ Approve" button
  2. handleApproveNGO(ngoId) called
  3. setActionLoading(ngoId) → shows loading state
  4. Fetch with:
     - Method: PUT
     - URL: /api/organizations/:id/approve
     - Headers: { Authorization: Bearer <token> }

                         ▼

Backend:
  1. Route: PUT /api/organizations/:id/approve
  2. Middleware:
     - authMiddleware (verify token)
     - roleCheck('ADMIN') (verify admin role)
  3. Controller: approveOrganization()
  4. Processing:
     - Find organization by _id or uuid
     - Set verification_status = 'APPROVED'
     - Set verified_by = admin._id
     - Set verified_date = new Date()
     - Save organization
     - Send approval email
     - Create notification
  5. Response: { success: true, organization: {...} }

                         ▼

Frontend:
  1. Response received
  2. Update ngos array: map(ngo => ngo._id === id ? {...new data} : ngo)
  3. setActionLoading(null) → remove loading state
  4. Table re-renders with updated status
  5. User sees "✓ Verified" badge
  6. Alert success message shown
```

---

## Database State Changes

```
┌─────────────────────────────────────────────────────────┐
│          ORGANIZATION DOCUMENT STATE CHANGES            │
└─────────────────────────────────────────────────────────┘

BEFORE APPROVAL:
{
  _id: ObjectId("..."),
  name: "Hope Foundation",
  email: "hope@foundation.org",
  organization_type: "NGO",
  address: "...",
  city: "Mumbai",
  state: "MH",
  verification_status: "PENDING",  ← Status is PENDING
  verified_by: null,               ← No admin has verified
  verified_date: null,             ← No verification date
  created_by: ObjectId("..."),
  createdAt: 2025-12-15T10:00:00Z,
  ...
}

                    ▼ ADMIN CLICKS APPROVE ▼

AFTER APPROVAL:
{
  _id: ObjectId("..."),
  name: "Hope Foundation",
  email: "hope@foundation.org",
  organization_type: "NGO",
  address: "...",
  city: "Mumbai",
  state: "MH",
  verification_status: "APPROVED",       ← Status changed to APPROVED
  verified_by: ObjectId("admin123"),     ← Recorded which admin approved
  verified_date: 2025-12-16T14:30:00Z,   ← Recorded when approved
  created_by: ObjectId("..."),
  createdAt: 2025-12-15T10:00:00Z,
  ...
}
```

---

## Color Code Reference

```
┌─────────────────────────────────────────────────────────┐
│         STATUS COLORS & VISUAL INDICATORS               │
└─────────────────────────────────────────────────────────┘

PENDING STATUS:
├─ Badge Color:        🟡 Amber/Yellow (#fbbf24)
├─ Text Color:         Dark Brown (#92400e)
├─ Background:         Pale Yellow (#fef3c7)
├─ Border:             Amber (#fbbf24)
├─ Row Highlight:      Pale Yellow (#fef3c7)
├─ Left Border:        Amber (#fbbf24) - 4px
├─ Icon:               ⏳ Hourglass
└─ Action Buttons:     Visible (Approve & Reject)

APPROVED STATUS:
├─ Badge Color:        🟢 Green (#10b981)
├─ Text Color:         Dark Green (#065f46)
├─ Background:         Pale Green (#d1fae5)
├─ Border:             Green (#6ee7b7)
├─ Row Highlight:      Normal White
├─ Left Border:        None
├─ Icon:               ✓ Checkmark
└─ Action Buttons:     Hidden ("✓ Verified" shown)

REJECTED STATUS:
├─ Badge Color:        🔴 Red (#ef4444)
├─ Text Color:         Dark Red (#7f1d1d)
├─ Background:         Pale Red (#fee2e2)
├─ Border:             Red (#fca5a5)
├─ Row Highlight:      Normal White
├─ Left Border:        None
├─ Icon:               ✕ X Mark
└─ Action Buttons:     Hidden
```

---

## Notifications Timeline

```
TIME                 EVENT                    RECIPIENT
─────────────────────────────────────────────────────────
T0: NGO Registers
    │
    ├─ Email sent                        → All Admins
    ├─ Notification: NGO_PENDING_APPROVAL → All Admins
    └─ Database: status = PENDING

T1: Admin Reviews
    │
    └─ Admin views dashboard
       └─ Sees pending NGO with alert

T2: Admin Approves
    │
    ├─ Email sent                        → NGO Creator
    ├─ Notification: ORGANIZATION_APPROVED → NGO Creator
    └─ Database: status = APPROVED

T3: Admin Rejects (Alternative)
    │
    ├─ Email sent with reason            → NGO Creator
    ├─ Notification: ORGANIZATION_REJECTED → NGO Creator
    └─ Database: status = REJECTED
```

---

This diagram provides a comprehensive visual representation of the entire NGO approval system flow!
