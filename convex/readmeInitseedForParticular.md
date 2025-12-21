# README: Budget Particulars Seeding Tutorial

## 📚 Table of Contents
- Overview
- Prerequisites
- Step-by-Step Guide
- Verification
- Troubleshooting
- What Gets Created

---

## Overview
The Budget Particulars seeding function initializes your database with **12 default budget categories** that are used throughout the system.  
These particulars are referenced by both **budget items** and **projects**.

### Default Particulars
- GAD - Gender and Development  
- LDRRMP - Local Disaster Risk Reduction and Management Plan  
- LCCAP - Local Climate Change Action Plan  
- LCPC - Local Council for the Protection of Children  
- SCPD - Sectoral Committee for Persons with Disabilities  
- POPS - Provincial Operations  
- CAIDS - Community Affairs and Information Development Services  
- LNP - Local Nutrition Program  
- PID - Provincial Information Department  
- ACDP - Agricultural Competitiveness Development Program  
- LYDP - Local Youth Development Program  
- 20%_DF - 20% Development Fund  

---

## Prerequisites
Before running the seed function, ensure:

- ✅ **Database is deployed** – Your Convex backend must be running  
- ✅ **Super Admin account exists** – At least one user with role `super_admin`  
- ✅ **Schema is deployed** – The `budgetParticulars` table exists  

---

## Step-by-Step Guide

### Method 1: Using Convex Dashboard (Recommended)
1. Navigate to https://dashboard.convex.dev  
2. Go to your project → **Functions** tab  
3. Locate:
   - `init/seedBudgetParticulars.ts`
   - Mutation: `initializeDefaultParticulars`
4. Click **Run** (no arguments required)

**Expected result:**
```json
{
  "success": true,
  "inserted": 12,
  "total": 12,
  "insertedIds": ["...", "..."]
}
```

---

### Method 2: Using Frontend Code (Programmatic)
Example setup page:

```ts
"use client";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";

export default function SetupPage() {
  const [isSeeding, setIsSeeding] = useState(false);
  const seedParticulars = useMutation(
    api.init.seedBudgetParticulars.initializeDefaultParticulars
  );

  const handleSeed = async () => {
    try {
      setIsSeeding(true);
      const result = await seedParticulars();
      toast.success("Seeding completed!", {
        description: `Inserted ${result.inserted} out of ${result.total} particulars`,
      });
    } catch (error) {
      toast.error("Seeding failed");
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <Button onClick={handleSeed} disabled={isSeeding}>
      {isSeeding ? "Seeding..." : "Seed Budget Particulars"}
    </Button>
  );
}
```

---

### Method 3: Using Convex CLI (Advanced)
```bash
cd your-project-directory
npx convex run init/seedBudgetParticulars:initializeDefaultParticulars
```

---

## Verification

### 1. Check total count
```ts
const particulars = await ctx.db.query("budgetParticulars").collect();
console.log(particulars.length);
```
Expected: **12**

### 2. Verify a specific record
```ts
const gad = await ctx.db
  .query("budgetParticulars")
  .withIndex("code", (q) => q.eq("code", "GAD"))
  .first();
console.log(gad);
```

---

## Troubleshooting

- ❌ **Not authenticated**  
  → Login as `super_admin`

- ❌ **Only super_admin can initialize default particulars**  
  → Update user role

- ❌ **Table budgetParticulars not found**  
  → Deploy schema: `npx convex deploy`

- ⚠️ **Already exists, skipping**  
  → Expected behavior (idempotent)

---

## What Gets Created

Each budget particular includes:
- `code`
- `fullName`
- `description`
- `category`
- `colorCode`
- `displayOrder`
- `isActive`
- `isSystemDefault`
- `usageCount`
- `projectUsageCount`

---

## Important Notes

- 🔒 System defaults **cannot be deleted**
- 🔁 Safe to run multiple times
- 📊 Usage counts are tracked automatically

---

## Support
If issues occur:
- Check Convex dashboard logs
- Verify `super_admin` role
- Confirm schema deployment

---

**Last Updated:** December 2024  
**Version:** 1.0.0
