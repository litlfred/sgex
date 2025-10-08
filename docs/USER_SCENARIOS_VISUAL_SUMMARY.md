# User Scenarios - Visual Summary

## 🎯 What We're Building

A new DAK component for editing user scenario markdown files with persona variable substitution.

### Before (Current State)
```
❌ /user-scenarios/litlfred/smart-ips-pilgrimage/main
    → 404 Error: Page not found
```

### After (Proposed Solution)
```
✅ /user-scenarios/litlfred/smart-ips-pilgrimage/main
    → User Scenarios Manager (list of scenarios)
    → Click "Edit" → Modal editor with markdown
    → Save to staging ground → Commit later
```

---

## 📱 User Interface Design

### Page 1: User Scenarios List
```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ 👥 User Scenarios - smart-ips-pilgrimage on main    ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

┌────────────────────────────────────────────────────┐
│ 📊 Repository: litlfred/smart-ips-pilgrimage       │
│ 🌿 Branch: main                                    │
│ 📂 Component: User Scenarios                       │
└────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────┐
│              [+ Create New Scenario]                │
└────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────┐
│ 📄 Existing User Scenarios (3)                     │
│                                                    │
│ ┌──────────────────────────────────────────────┐  │
│ │ 📝 userscenario-pilgrim-registration.md      │  │
│ │ Last modified: 2 days ago                    │  │
│ │                              [👁️ View] [✏️ Edit]│  │
│ └──────────────────────────────────────────────┘  │
│                                                    │
│ ┌──────────────────────────────────────────────┐  │
│ │ 📝 userscenario-health-check.md              │  │
│ │ Last modified: 1 week ago                    │  │
│ │                              [👁️ View] [✏️ Edit]│  │
│ └──────────────────────────────────────────────┘  │
│                                                    │
│ ┌──────────────────────────────────────────────┐  │
│ │ 📝 userscenario-vaccination-record.md        │  │
│ │ Last modified: 2 weeks ago                   │  │
│ │                              [👁️ View] [✏️ Edit]│  │
│ └──────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────┐
│ 📦 Staging Ground (0 changed files)                │
│ No changes staged                                  │
└────────────────────────────────────────────────────┘
```

### Page 2: Edit Scenario Modal
```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ Modal Overlay (semi-transparent gray)              ┃
┃                                                    ┃
┃  ┌──────────────────────────────────────────────┐ ┃
┃  │ ✏️ Edit User Scenario                         │ ┃
┃  │ userscenario-pilgrim-registration.md         │ ┃
┃  │                                              │ ┃
┃  │ [✏️ Edit Mode] [👁️ Preview Mode]              │ ┃
┃  │ [Cancel]                [Stage Changes]      │ ┃
┃  ├──────────────────────────────────────────────┤ ┃
┃  │ 🔤 Variable Helper                           │ ┃
┃  │ [Insert Persona Variable ▼]                 │ ┃
┃  ├──────────────────────────────────────────────┤ ┃
┃  │ Markdown Editor                              │ ┃
┃  │ ─────────────────────────────────────────── │ ┃
┃  │                                              │ ┃
┃  │ # Pilgrim Registration Scenario              │ ┃
┃  │                                              │ ┃
┃  │ The {{persona.healthcare-worker.title}}      │ ┃
┃  │ registers a new pilgrim for the Hajj.        │ ┃
┃  │                                              │ ┃
┃  │ ## Steps                                     │ ┃
┃  │ 1. Verify pilgrim identity                   │ ┃
┃  │ 2. Check vaccination status                  │ ┃
┃  │ 3. Register in system                        │ ┃
┃  │                                              │ ┃
┃  │ The {{persona.pilgrim.title}} receives       │ ┃
┃  │ a confirmation number.                       │ ┃
┃  │                                              │ ┃
┃  └──────────────────────────────────────────────┘ ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
```

### Page 3: Preview Mode
```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ Modal Overlay                                      ┃
┃                                                    ┃
┃  ┌──────────────────────────────────────────────┐ ┃
┃  │ 👁️ Preview User Scenario                      │ ┃
┃  │ userscenario-pilgrim-registration.md         │ ┃
┃  │                                              │ ┃
┃  │ [✏️ Edit Mode] [👁️ Preview Mode]              │ ┃
┃  │ [Cancel]                [Stage Changes]      │ ┃
┃  ├──────────────────────────────────────────────┤ ┃
┃  │ Preview with Variables Substituted:          │ ┃
┃  ├──────────────────────────────────────────────┤ ┃
┃  │                                              │ ┃
┃  │ # Pilgrim Registration Scenario              │ ┃
┃  │                                              │ ┃
┃  │ The Healthcare Worker registers a new        │ ┃
┃  │ pilgrim for the Hajj.                        │ ┃
┃  │                                              │ ┃
┃  │ ## Steps                                     │ ┃
┃  │ 1. Verify pilgrim identity                   │ ┃
┃  │ 2. Check vaccination status                  │ ┃
┃  │ 3. Register in system                        │ ┃
┃  │                                              │ ┃
┃  │ The Pilgrim receives a confirmation number.  │ ┃
┃  │                                              │ ┃
┃  └──────────────────────────────────────────────┘ ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

Notice: Variables were replaced:
{{persona.healthcare-worker.title}} → Healthcare Worker
{{persona.pilgrim.title}} → Pilgrim
```

### Page 4: Create New Scenario
```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ Modal Overlay                                      ┃
┃                                                    ┃
┃  ┌──────────────────────────────────────────────┐ ┃
┃  │ ➕ Create New User Scenario                   │ ┃
┃  │                                              │ ┃
┃  │ Scenario ID (lowercase, hyphens only):      │ ┃
┃  │ ┌──────────────────────────────────────────┐│ ┃
┃  │ │userscenario-[enter-id-here]              ││ ┃
┃  │ └──────────────────────────────────────────┘│ ┃
┃  │                                              │ ┃
┃  │ ℹ️ ID Requirements:                          │ ┃
┃  │ • Must be lowercase                          │ ┃
┃  │ • Use hyphens to separate words              │ ┃
┃  │ • No spaces or special characters            │ ┃
┃  │ • Must be unique in repository               │ ┃
┃  │                                              │ ┃
┃  │ Examples:                                    │ ┃
┃  │ ✅ userscenario-health-check-001             │ ┃
┃  │ ✅ userscenario-vaccination-record           │ ┃
┃  │ ❌ UserScenario-Test (uppercase)             │ ┃
┃  │ ❌ userscenario--double (consecutive -)      │ ┃
┃  │                                              │ ┃
┃  │ [Cancel]                    [Create & Edit]  │ ┃
┃  └──────────────────────────────────────────────┘ ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
```

### Page 5: Persona Variable Dropdown
```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  │ 🔤 Variable Helper                           │ ┃
┃  │ [Insert Persona Variable ▼] ← CLICKED       │ ┃
┃  │    ┌────────────────────────────────────┐   │ ┃
┃  │    │ Healthcare Worker                  │   │ ┃
┃  │    │  ├─ Insert title                   │   │ ┃
┃  │    │  ├─ Insert description             │   │ ┃
┃  │    │  └─ Insert id                      │   │ ┃
┃  │    │ Pilgrim                            │   │ ┃
┃  │    │  ├─ Insert title                   │   │ ┃
┃  │    │  ├─ Insert description             │   │ ┃
┃  │    │  └─ Insert id                      │   │ ┃
┃  │    │ Community Health Worker            │   │ ┃
┃  │    │  ├─ Insert title                   │   │ ┃
┃  │    │  └─ Insert description             │   │ ┃
┃  │    └────────────────────────────────────┘   │ ┃
┃  │                                              │ ┃
┃  │ When clicked, inserts:                       │ ┃
┃  │ {{persona.healthcare-worker.title}}          │ ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
```

---

## 🔄 User Flow Diagram

### Flow 1: Edit Existing Scenario
```
┌─────────────────┐
│ User navigates  │
│ to page         │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Scenarios list  │
│ displayed       │
└────────┬────────┘
         │
         │ User clicks [Edit]
         ▼
┌─────────────────┐
│ Modal opens     │
│ with content    │
└────────┬────────┘
         │
         │ User edits markdown
         │ User toggles preview
         │ User inserts variables
         ▼
┌─────────────────┐
│ User clicks     │
│ [Stage Changes] │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Saved to        │
│ Staging Ground  │
└────────┬────────┘
         │
         │ Later...
         ▼
┌─────────────────┐
│ User commits    │
│ from Staging    │
└─────────────────┘
```

### Flow 2: Create New Scenario
```
┌─────────────────┐
│ User clicks     │
│ [Create New]    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ ID input modal  │
│ displayed       │
└────────┬────────┘
         │
         │ User enters ID
         │ System validates
         ▼
┌─────────────────┐
│ ✅ Valid ID     │
│ Modal opens     │
└────────┬────────┘
         │
         │ User writes content
         │ User inserts variables
         ▼
┌─────────────────┐
│ [Stage Changes] │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ New file staged │
│ in Staging      │
│ Ground          │
└─────────────────┘
```

---

## 🎨 Color Scheme

### WHO SMART Guidelines Colors
```
┌─────────────────────────────────────┐
│ Header Background: #040b76          │ ← WHO Deep Blue
│ ████████████████████████████████    │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Page Background: Gradient           │
│ From: #0078d4 (Blue)                │
│ █████████████████                   │
│ To: #005a9e (Darker Blue)           │
│         ████████████████████████    │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Card Background: #ffffff            │ ← White
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░    │
│ With shadow: 0 4px 20px rgba(0,0,0,0.1)
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Primary Button: #0078d4             │ ← WHO Blue
│ ████████████████████████████████    │
│ Text: #ffffff (White)               │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Secondary Button: #6c757d           │ ← Gray
│ ████████████████████████████████    │
│ Text: #ffffff (White)               │
└─────────────────────────────────────┘
```

---

## 🗂️ File Structure

### Repository Structure
```
smart-ips-pilgrimage/
├── input/
│   ├── pagecontent/
│   │   ├── userscenario-pilgrim-registration.md    ← User scenarios here
│   │   ├── userscenario-health-check.md            ← Pattern: userscenario-*.md
│   │   ├── userscenario-vaccination-record.md      ← Detected automatically
│   │   └── other-page.md                           ← Not a user scenario
│   ├── fsh/
│   │   └── personas.fsh                            ← Persona definitions
│   └── resources/
│       └── Person-healthcare-worker.json           ← FHIR Person resources
└── sushi-config.yaml
```

### Code Structure
```
sgex/src/
├── components/
│   ├── UserScenariosManager.js          ← NEW: Main list component
│   ├── UserScenariosManager.css         ← NEW: Styling
│   ├── UserScenarioEditModal.js         ← NEW: Editor modal
│   ├── UserScenarioEditModal.css        ← NEW: Modal styling
│   ├── PagesManager.js                  ← REFERENCE: Similar pattern
│   └── PageEditModal.js                 ← REFERENCE: Similar pattern
├── services/
│   ├── componentRouteService.js         ← MODIFY: Add lazy loading
│   ├── helpContentService.js            ← MODIFY: Add help topics
│   ├── stagingGroundService.js          ← USE: Already exists
│   └── githubService.js                 ← USE: Already exists
└── public/
    └── routes-config.json               ← MODIFY: Add route
```

---

## 🎯 Implementation Checklist

### Phase 1: Core Component (4-6 hours)
```
┌─────────────────────────────────────────┐
│ ☐ Create UserScenariosManager.js       │
│   ├─ ☐ URL parameter extraction        │
│   ├─ ☐ GitHub API integration          │
│   ├─ ☐ Scenario list display           │
│   ├─ ☐ Create button                   │
│   └─ ☐ Edit buttons                    │
│                                         │
│ ☐ Create UserScenariosManager.css      │
│   ├─ ☐ WHO color scheme                │
│   ├─ ☐ Card layouts                    │
│   └─ ☐ Responsive design               │
└─────────────────────────────────────────┘
```

### Phase 2: Editor Modal (2-3 hours)
```
┌─────────────────────────────────────────┐
│ ☐ Create UserScenarioEditModal.js      │
│   ├─ ☐ Markdown editor integration     │
│   ├─ ☐ Edit/preview toggle             │
│   ├─ ☐ WHO SOP ID validation           │
│   ├─ ☐ Variable substitution UI        │
│   └─ ☐ Staging ground save             │
│                                         │
│ ☐ Create UserScenarioEditModal.css     │
│   ├─ ☐ Modal overlay styling           │
│   ├─ ☐ Editor container styling        │
│   └─ ☐ Button styling                  │
└─────────────────────────────────────────┘
```

### Phase 3: Integration (2 hours)
```
┌─────────────────────────────────────────┐
│ ☐ Update routes-config.json            │
│ ☐ Update componentRouteService.js      │
│ ☐ Update helpContentService.js         │
│ ☐ Update DAKDashboard.js (add card)    │
│ ☐ Variable substitution logic          │
│ ☐ Persona data loading                 │
└─────────────────────────────────────────┘
```

### Phase 4: Testing (2-3 hours)
```
┌─────────────────────────────────────────┐
│ ☐ Create integration tests             │
│ ☐ Test scenario listing                │
│ ☐ Test scenario creation               │
│ ☐ Test scenario editing                │
│ ☐ Test variable substitution           │
│ ☐ Test staging ground integration      │
│ ☐ Take UI screenshots                  │
│ ☐ Manual testing with real DAK         │
└─────────────────────────────────────────┘
```

---

## ⚠️ Critical Questions (Need Answers)

### Question 1: WHO SOP ID Pattern
```
Proposed: userscenario-[a-z0-9]+(-[a-z0-9]+)*

Examples:
✅ userscenario-001
✅ userscenario-anc-registration
✅ userscenario-health-check-v2
❌ UserScenario-001 (uppercase)
❌ userscenario--test (consecutive hyphens)
❌ userscenario- (trailing hyphen)

Question: Is this pattern correct?
```

### Question 2: Variable Syntax
```
Proposed: {{persona.healthcare-worker.title}}

Format: {{persona.{id}.{property}}}

Question: Is this the correct syntax?
Alternative: ${persona.healthcare-worker.title}
```

### Question 3: Persona Properties
```
Proposed properties:
- id
- title
- description
- type
- code

Question: Complete list of available properties?
```

### Question 4: Persona Data Source
```
Possible locations:
- input/fsh/personas.fsh
- input/resources/Person-*.json
- input/resources/Practitioner-*.json

Question: Where should we load persona data from?
```

### Question 5: File Location
```
Proposed: input/pagecontent/userscenario-{id}.md

Question: Is this the correct location pattern?
```

---

## 📊 Benefits Summary

### For Content Authors
```
✅ Easy-to-use markdown editor
✅ Visual preview mode
✅ Persona variable insertion (no memorization)
✅ WHO SOP ID guidance
✅ Changes staged for review
```

### For Reviewers
```
✅ All changes visible in staging ground
✅ Batch review before commit
✅ Easy rollback if needed
✅ Clear change history
```

### For Administrators
```
✅ WHO SMART Guidelines compliant
✅ Consistent file naming
✅ Standardized persona references
✅ Audit trail via staging ground
```

### For Developers
```
✅ Follows existing patterns
✅ No new dependencies
✅ Well-documented architecture
✅ Comprehensive tests
✅ Easy to maintain
```

---

## 🚀 Next Steps

1. **Review this visual summary** (5 minutes)
2. **Answer the 5 critical questions** (in PR comment)
3. **Approve implementation** (give go-ahead)
4. **Implementation begins** (11-16 hours)
5. **Review with screenshots** (as progress updates come in)

---

**Status**: 🟡 Awaiting Feedback on 5 Questions  
**Timeline**: 11-16 hours after approval  
**Documents**: 4 comprehensive planning docs created  
**Ready**: Yes, all planning complete  

**Questions?** See [USER_SCENARIOS_FEEDBACK_NEEDED.md](./USER_SCENARIOS_FEEDBACK_NEEDED.md)
