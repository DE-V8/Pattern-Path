# PatternPath 🚀  
**Learn once. Revise forever.**

PatternPath is a pattern-based DSA learning platform focused on long-term retention, real progress tracking, and seamless cloud sync. It is built with a **local-first architecture** for instant UX and Supabase for secure persistence across devices.

---

## ✨ Features

### 📚 Pattern-Based Learning
Learn DSA through structured problem-solving patterns:
- Arrays & Hashing
- Two Pointers
- Sliding Window
- Stack
- Binary Search
- Linked List
- Trees (DFS / BFS)
- Graphs
- Dynamic Programming
- Backtracking

Each pattern includes Easy, Medium, and Hard problems.

---

### ✅ Progress Tracking
- Checkbox-based problem completion
- Automatic calculation of:
  - Problems completed
  - Total problems
  - Completion percentage
- Animated circular progress indicators
- Per-pattern and global progress views

---

### ⚡ Local-First (Instant UX)
PatternPath prioritizes speed and reliability:

- Progress is saved instantly to `localStorage`
- UI updates immediately (no waiting)
- Cloud sync happens asynchronously

This ensures:
- Zero lag
- Offline support
- No UI flicker or delays

---

### ☁️ Cloud Sync (Supabase)
Progress is synced to Supabase using:
- `user_id`
- `lesson_id`

On page load:
1. Data is restored from `localStorage`
2. UI renders instantly
3. Supabase data is fetched and merged
4. Any differences are re-synced

---

### 🔐 Authentication
- Supabase Auth (email-based)
- Automatic session restoration
- Secure Row Level Security (RLS)
- Users can only access their own data

---

### 💳 Credit System
- Earn **1 credit per completed lesson**
- Credits are:
  - Stored locally for instant updates
  - Synced to Supabase for persistence
- Credits power mentorship features

---

### 🧠 Mentorship Terminal
- Terminal-style mentorship interface
- Credits are spent per interaction
- Real-time credit balance updates

---

## 🏗️ Architecture Overview

### Progress Flow
```

User Action
→ Save to localStorage
→ Update UI instantly
→ Sync to Supabase (background)

```

### Restore Flow
```

Page Load
→ Restore from localStorage
→ Render UI
→ Fetch Supabase data
→ Merge & resync

```

---

## 🧪 Tech Stack

**Frontend**
- HTML
- CSS (Tailwind)
- Vanilla JavaScript

**Backend**
- Supabase
  - Auth
  - PostgreSQL
  - Row Level Security

**Deployment**
- GitHub
- Netlify

---

## 📂 Project Structure

```

/dashboard
├── patterns.html
├── categories.html
/js
├── progress.js
├── supabase-client.js
├── credits.js
├── auth.js
/version202/
├── patterns/
├── arrays.html
├── two-pointers.html

```

---

## 🔒 Security
- RLS enabled on all user tables
- `auth.uid()` enforced at database level
- No sensitive data stored client-side
- Frontend uses Supabase anon key only

---

## 🚧 Roadmap
- Mentor marketplace
- Paid mentorship sessions
- Community discussions
- Mobile PWA support
- Advanced analytics dashboard

---

## 👨‍💻 Author
Built by **Debjit and Pratham** with a focus on clarity, performance, and real learning.

If you want a DSA system that actually sticks—  
**PatternPath is built for you.**

---

## ⭐ Support
If this project helped you:
- Star the repository
- Share it
- Contribute improvements
```


