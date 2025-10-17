# User Scenarios Component Architecture

## Component Hierarchy

```
┌─────────────────────────────────────────────────────────────────┐
│                    App.js (Router)                               │
│  Route: /user-scenarios/:user/:repo/:branch                     │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│              UserScenariosManager Component                      │
│                                                                  │
│  State:                                                          │
│    - scenarios: Array<ScenarioFile>                             │
│    - loading: boolean                                           │
│    - error: string | null                                       │
│    - hasWriteAccess: boolean                                    │
│                                                                  │
│  Effects:                                                        │
│    - Load scenarios from input/pagecontent/userscenario-*.md   │
│    - Initialize staging ground service                          │
│    - Check write permissions                                    │
│                                                                  │
│  Render:                                                         │
│    ┌─────────────────────────────────────────────────┐         │
│    │ Header (WHO SMART Guidelines branding)          │         │
│    └─────────────────────────────────────────────────┘         │
│    ┌─────────────────────────────────────────────────┐         │
│    │ DAKStatusBox (repo/branch info)                 │         │
│    └─────────────────────────────────────────────────┘         │
│    ┌─────────────────────────────────────────────────┐         │
│    │ [Create New Scenario] Button                     │         │
│    └─────────────────────────────────────────────────┘         │
│    ┌─────────────────────────────────────────────────┐         │
│    │ Scenario List                                    │         │
│    │   ┌───────────────────────────────────────┐     │         │
│    │   │ userscenario-001.md         [Edit]    │     │         │
│    │   └───────────────────────────────────────┘     │         │
│    │   ┌───────────────────────────────────────┐     │         │
│    │   │ userscenario-anc-reg.md     [Edit]    │     │         │
│    │   └───────────────────────────────────────┘     │         │
│    └─────────────────────────────────────────────────┘         │
│    ┌─────────────────────────────────────────────────┐         │
│    │ StagingGround Component                          │         │
│    └─────────────────────────────────────────────────┘         │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       │ [Edit] or [Create] clicked
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│            UserScenarioEditModal Component                       │
│                                                                  │
│  Props:                                                          │
│    - scenario: ScenarioFile | null (null = new)                │
│    - onClose: () => void                                        │
│    - onSave: (path, content) => void                           │
│    - personas: Array<Persona> (for variables)                  │
│                                                                  │
│  State:                                                          │
│    - content: string (markdown content)                         │
│    - mode: 'edit' | 'preview'                                  │
│    - scenarioId: string (for new scenarios)                    │
│    - validationError: string | null                            │
│    - isSaving: boolean                                         │
│                                                                  │
│  Render:                                                         │
│    ┌─────────────────────────────────────────────────┐         │
│    │ Modal Overlay                                    │         │
│    │  ┌─────────────────────────────────────────┐    │         │
│    │  │ Header                                   │    │         │
│    │  │   Edit: userscenario-{id}.md            │    │         │
│    │  │   [✏️ Edit] [👁️ Preview] [Cancel] [Save] │    │         │
│    │  └─────────────────────────────────────────┘    │         │
│    │  ┌─────────────────────────────────────────┐    │         │
│    │  │ (If new scenario)                        │    │         │
│    │  │ Scenario ID: [userscenario-________]    │    │         │
│    │  │ ⚠️ ID validation messages                │    │         │
│    │  └─────────────────────────────────────────┘    │         │
│    │  ┌─────────────────────────────────────────┐    │         │
│    │  │ Variable Helper Toolbar                  │    │         │
│    │  │ [Insert Persona Variable ▼]             │    │         │
│    │  └─────────────────────────────────────────┘    │         │
│    │  ┌─────────────────────────────────────────┐    │         │
│    │  │ MDEditor Component                       │    │         │
│    │  │                                          │    │         │
│    │  │ (Edit mode: full editor)                │    │         │
│    │  │ (Preview mode: rendered with variables) │    │         │
│    │  │                                          │    │         │
│    │  │ Height: 500px                           │    │         │
│    │  └─────────────────────────────────────────┘    │         │
│    └─────────────────────────────────────────────────┘         │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow

```
┌────────────────────┐
│   User Action      │
│  (Edit Scenario)   │
└─────────┬──────────┘
          │
          ▼
┌─────────────────────────────────────────┐
│  UserScenariosManager                    │
│  - Fetches scenario content from GitHub │
│  - Opens UserScenarioEditModal          │
└─────────┬───────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────┐
│  UserScenarioEditModal                   │
│  - User edits markdown content          │
│  - User toggles edit/preview            │
│  - User inserts persona variables       │
│  - User clicks Save                     │
└─────────┬───────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────┐
│  stagingGroundService.updateFile()      │
│  - Saves to localStorage                │
│  - Metadata: tool, contentType          │
│  - Triggers listeners                   │
└─────────┬───────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────┐
│  StagingGround Component                 │
│  - Displays staged file                 │
│  - User can commit later                │
│  - User can discard changes             │
└──────────────────────────────────────────┘
```

## Service Dependencies

```
┌──────────────────────────────────────────────────────────┐
│                UserScenariosManager                       │
└────┬───────────────────────┬───────────────────────┬────┘
     │                       │                       │
     │                       │                       │
     ▼                       ▼                       ▼
┌─────────────┐     ┌──────────────────┐   ┌──────────────┐
│ githubService│     │stagingGroundService│   │helpContentService│
│             │     │                  │   │              │
│ - getContent │     │ - initialize()   │   │ - getTopics() │
│ - listFiles  │     │ - updateFile()   │   │              │
│ - checkPerms │     │ - getStagingGround│   └──────────────┘
└─────────────┘     └──────────────────┘
```

## Variable Substitution Flow

```
┌────────────────────────────────────────────────────────────┐
│  User Types in Editor:                                     │
│  "The {{persona.healthcare-worker.title}} examines..."    │
└────────────────────┬───────────────────────────────────────┘
                     │
                     │ User clicks Preview
                     ▼
┌────────────────────────────────────────────────────────────┐
│  Variable Substitution Engine                              │
│                                                            │
│  1. Parse content for {{...}} patterns                    │
│  2. Extract: persona.healthcare-worker.title              │
│  3. Lookup persona by ID: "healthcare-worker"             │
│  4. Get property: "title"                                 │
│  5. Replace with value: "Healthcare Worker"               │
└────────────────────┬───────────────────────────────────────┘
                     │
                     ▼
┌────────────────────────────────────────────────────────────┐
│  Preview Mode Displays:                                    │
│  "The Healthcare Worker examines..."                       │
└────────────────────────────────────────────────────────────┘
```

## Persona Data Sources

```
┌────────────────────────────────────────────────────────────┐
│  Generic Personas (From smart-base DAK)                    │
└────────────────────┬───────────────────────────────────────┘
                     │
        ┌────────────┼────────────┬─────────────────┐
        │            │            │                 │
        ▼            ▼            ▼                 ▼
┌─────────────┐ ┌─────────┐ ┌──────────┐ ┌─────────────────┐
│ FHIR Person │ │FSH Files│ │OCL Codes │ │JSON Definitions │
│ Resources   │ │         │ │          │ │                 │
│             │ │ input/  │ │ input/   │ │ input/          │
│ input/fhir/ │ │ fsh/    │ │ vocab/   │ │ resources/      │
└─────────────┘ └─────────┘ └──────────┘ └─────────────────┘
        │            │            │                 │
        └────────────┴────────────┴─────────────────┘
                     │
                     ▼
        ┌────────────────────────┐
        │  Persona Registry      │
        │  (Cache in memory)     │
        │                        │
        │  {                     │
        │    "healthcare-worker": {
        │      id: "...",        │
        │      title: "...",     │
        │      description: "..." │
        │    }                   │
        │  }                     │
        └────────────────────────┘
```

## File System Structure

```
repository/
├── input/
│   ├── pagecontent/
│   │   ├── userscenario-001.md          ← User scenarios here
│   │   ├── userscenario-anc-reg.md      ← Detected by pattern
│   │   ├── userscenario-hiv-test.md     ← userscenario-*.md
│   │   └── other-page.md                ← Not a scenario
│   ├── fsh/
│   │   └── personas.fsh                 ← Persona definitions
│   └── resources/
│       └── personas.json                ← Or as JSON
└── sushi-config.yaml
```

## WHO SOP ID Validation Flow

```
┌────────────────────────────────────────────────────────────┐
│  User Creates New Scenario                                 │
│  Input: "ANC-Registration-001"                             │
└────────────────────┬───────────────────────────────────────┘
                     │
                     ▼
┌────────────────────────────────────────────────────────────┐
│  ID Validation Steps                                       │
│                                                            │
│  1. Convert to lowercase: "anc-registration-001"          │
│  2. Add prefix: "userscenario-anc-registration-001"       │
│  3. Check pattern: ^userscenario-[a-z0-9]+(-[a-z0-9]+)*$ │
│     ✅ Match                                               │
│  4. Check uniqueness in repository                        │
│     ✅ Not found (unique)                                  │
└────────────────────┬───────────────────────────────────────┘
                     │
                     ▼
┌────────────────────────────────────────────────────────────┐
│  Create file: input/pagecontent/                           │
│               userscenario-anc-registration-001.md         │
└────────────────────────────────────────────────────────────┘
```

## Error Handling

```
┌────────────────────────────────────────────────────────────┐
│  Error Scenarios                                           │
└────────┬───────────────────────────────────────────────────┘
         │
    ┌────┴────┬──────────┬───────────┬──────────────┐
    │         │          │           │              │
    ▼         ▼          ▼           ▼              ▼
┌────────┐ ┌─────┐ ┌─────────┐ ┌────────┐ ┌──────────────┐
│No Auth │ │No   │ │Invalid  │ │File    │ │LocalStorage │
│        │ │Write│ │WHO SOP  │ │Conflict│ │Full         │
│        │ │Access│ │ID       │ │        │ │             │
└────────┘ └─────┘ └─────────┘ └────────┘ └──────────────┘
    │         │          │           │              │
    └─────────┴──────────┴───────────┴──────────────┘
                         │
                         ▼
            ┌────────────────────────┐
            │  Error Display         │
            │  - User-friendly msg   │
            │  - Suggested action    │
            │  - Retry option        │
            └────────────────────────┘
```

## Integration Points

### 1. Route Configuration
```javascript
// public/routes-config.json
{
  "dakComponents": {
    "user-scenarios": {
      "component": "UserScenariosManager",
      "path": "./components/UserScenariosManager"
    }
  }
}
```

### 2. Lazy Loading
```javascript
// src/services/componentRouteService.js
case 'UserScenariosManager':
  LazyComponent = React.lazy(() => 
    import('../components/UserScenariosManager')
  );
  break;
```

### 3. Help Content
```javascript
// src/services/helpContentService.js
helpTopics['user-scenarios'] = [
  {
    id: 'user-scenarios-overview',
    title: 'User Scenarios Overview',
    type: 'slideshow',
    content: [...]
  }
];
```

### 4. DAK Dashboard Card
```javascript
// src/components/DAKDashboard.js
{
  title: 'User Scenarios',
  description: 'Edit user interaction scenarios',
  icon: '👥',
  route: `/user-scenarios/${user}/${repo}/${branch}`,
  status: scenarios.length > 0 ? 'complete' : 'todo'
}
```

## Styling Guidelines

### Color Scheme (WHO SMART Guidelines)
```css
/* Header */
background: rgb(4, 11, 118);  /* Deep blue */
color: white;

/* Page Background */
background: linear-gradient(135deg, #0078d4 0%, #005a9e 100%);

/* Cards */
background: var(--who-card-bg);  /* White with shadow */
border-radius: 12px;
box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);

/* Buttons */
primary: var(--who-blue);  /* #0078d4 */
secondary: var(--who-gray);
success: var(--who-green);
```

### Responsive Breakpoints
```css
/* Desktop */
@media (min-width: 1024px) { ... }

/* Tablet */
@media (min-width: 768px) and (max-width: 1023px) { ... }

/* Mobile */
@media (max-width: 767px) { ... }
```

## Performance Considerations

### Lazy Loading
- Component code split with React.lazy()
- MDEditor lazy loaded on modal open
- Persona data cached after first load

### Caching Strategy
```javascript
// Cache persona data in memory
const personaCache = new Map();

// Cache GitHub API responses
const scenarioListCache = new Map();
const TTL = 5 * 60 * 1000; // 5 minutes
```

### Debouncing
```javascript
// Debounce variable substitution in preview
const debouncedSubstitute = useMemo(
  () => debounce(substituteVariables, 300),
  [personas]
);
```

## Security Considerations

### Input Validation
- WHO SOP ID pattern validation
- Path traversal prevention
- XSS prevention in markdown rendering

### Access Control
- Check write permissions before allowing edit
- Verify authenticated user
- Validate repository access

### Data Protection
- No sensitive data in localStorage
- Clear staging ground on logout
- Sanitize markdown content

---

**Status**: Architecture Design Complete  
**Next**: Awaiting approval to implement  
**Questions**: See USER_SCENARIOS_IMPLEMENTATION_PLAN.md
