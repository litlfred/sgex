# User Scenarios Implementation - Awaiting Feedback

## Summary

I have completed a comprehensive analysis of the SGEX codebase and created a detailed implementation plan for adding user scenarios functionality as requested in the issue. **I have NOT implemented any code yet**, as requested - this is a proposal only.

## What I've Created

### 1. Implementation Plan Document
**Location**: `docs/USER_SCENARIOS_IMPLEMENTATION_PLAN.md`

This document contains:
- ✅ Overview of user scenarios in WHO SMART Guidelines context
- ✅ Detailed architecture following existing PagesManager pattern
- ✅ WHO SOP ID requirements and validation rules
- ✅ Markdown editor design (edit/preview modes)
- ✅ Variable substitution framework design
- ✅ Staging ground integration approach
- ✅ Implementation phases with time estimates
- ✅ Testing strategy
- ✅ Success criteria and risk mitigation
- ⚠️ Critical questions requiring answers before implementation

### 2. Architecture Diagram Document
**Location**: `docs/USER_SCENARIOS_ARCHITECTURE.md`

This document contains:
- ✅ Component hierarchy ASCII diagrams
- ✅ Data flow visualizations
- ✅ Service dependency maps
- ✅ Variable substitution flow diagrams
- ✅ Persona data source options
- ✅ File system structure
- ✅ WHO SOP ID validation flow
- ✅ Error handling strategies
- ✅ Integration points (routing, help content, dashboard)
- ✅ Styling guidelines (WHO colors, responsive design)
- ✅ Performance and security considerations

## Key Design Decisions

### Following Existing Patterns
The implementation will follow the **PagesManager pattern** which is already proven in the codebase:
- List files from repository
- Edit with MDEditor modal
- Save to staging ground (no direct GitHub commits)
- WHO SMART Guidelines styling

### Using Existing Dependencies
No new npm packages required:
- `@uiw/react-md-editor@4.0.8` - Already installed for markdown editing
- `react-markdown` - Already installed for rendering
- `stagingGroundService` - Already implemented
- `githubService` - Already implemented

### Minimal Changes Approach
Following the "make minimal modifications" principle:
- Reuse existing components where possible
- Follow established routing patterns
- Use existing styling variables
- Integrate with existing services (staging ground, help content)

## Critical Questions Requiring Answers

Before I can proceed with implementation, I need clarification on these 5 critical questions:

### 1. WHO SOP ID Pattern Validation ⚠️
**Question**: Is the proposed ID pattern correct?
- **Format**: `userscenario-{identifier}`
- **Regex**: `^userscenario-[a-z0-9]+(-[a-z0-9]+)*$`
- **Examples**: 
  - ✅ `userscenario-001`
  - ✅ `userscenario-anc-registration`
  - ❌ `UserScenario-001` (uppercase not allowed)

**Why this matters**: ID validation needs to match WHO SMART Guidelines SOP requirements. If the pattern is wrong, we'll create non-compliant files.

**Where documented**: I searched for WHO SOP ID requirements in `public/docs/` but couldn't find specific documentation. Please point me to the right documentation or confirm the pattern.

### 2. Variable Substitution Syntax ⚠️
**Question**: What syntax should we use for persona variables?
- **Proposed**: `{{persona.{id}.{property}}}`
- **Example**: `{{persona.healthcare-worker.title}}`
- **Alternative**: `${persona.{id}.{property}}`

**Why this matters**: Variable syntax needs to be consistent with other variable substitution in the system. PR #997 mentioned variable substitution framework but I need to confirm the exact syntax.

**Reference**: The issue mentions "see in particular https://github.com/litlfred/sgex/pull/997" but I need specific syntax confirmation.

### 3. Persona Properties Available ⚠️
**Question**: Which properties from GenericPersona should be available?

From `packages/dak-core/src/types.ts`, I see:
```typescript
export interface GenericPersona {
  personas: any[];
}
```

**Proposed properties based on smart-base**:
- `id` - Unique identifier
- `title` - Display name/role
- `description` - Role description
- `type` - human or system
- `code` - FHIR coding

**Why this matters**: Users need to know which properties they can reference in their user scenario markdown. We need a clear list.

**Please provide**: The complete list of properties that should be available for variable substitution.

### 4. Persona Data Source Location ⚠️
**Question**: Where are generic personas stored in a DAK repository?

**Possible locations**:
- `input/fsh/personas.fsh` - FSH definitions
- `input/resources/Person-*.json` - FHIR Person resources
- `input/resources/Practitioner-*.json` - FHIR Practitioner resources
- Other location?

**Why this matters**: The code needs to know where to load persona data for variable substitution.

**Please provide**: The file path pattern where persona definitions can be found.

### 5. File Location Pattern Confirmation ⚠️
**Question**: Is `input/pagecontent/userscenario-{id}.md` the correct location?

**Assumptions**:
- ✅ Files are in `input/pagecontent/` directory
- ✅ Filename pattern is `userscenario-{id}.md`
- ✅ Content is markdown format

**Why this matters**: The code needs to scan the correct location and detect the right files.

**Please confirm or correct**: The exact file location pattern.

## How to Provide Feedback

### Option 1: Comment on the PR
Add comments to the PR with answers to the 5 critical questions above. For example:

```
## Answers to Critical Questions

### 1. WHO SOP ID Pattern
✅ The pattern is correct: `^userscenario-[a-z0-9]+(-[a-z0-9]+)*$`
OR
❌ The pattern should be: `^userscenario-[A-Z]{3}-[0-9]{3}$` instead

### 2. Variable Syntax
✅ Use `{{persona.id.property}}` as proposed
OR
❌ Use `${persona.id.property}` instead

### 3. Persona Properties
Available properties are:
- id
- title
- description
- role
- capabilities

### 4. Persona Data Source
Personas are stored in: `input/fsh/personas.fsh`

### 5. File Location
✅ Confirmed: `input/pagecontent/userscenario-{id}.md`
```

### Option 2: Reference Existing Documentation
If the answers are already documented somewhere, please point me to:
- WHO SOP ID documentation
- Variable substitution framework documentation (PR #997)
- Smart-base GenericPersona logical model documentation

### Option 3: Schedule a Discussion
If the questions require detailed discussion, we can:
- Have a brief meeting to clarify requirements
- Create a requirements issue to hash out details
- Iterate on the design in comments

## What Happens Next

### After Feedback Received ✅
1. Update implementation plan with confirmed requirements
2. Begin Phase 1: Create UserScenariosManager component
3. Create UserScenarioEditModal with confirmed patterns
4. Implement variable substitution with confirmed syntax
5. Add tests and documentation
6. Submit for review with screenshots

### Estimated Timeline
Once questions are answered:
- **Phase 1-2**: Core components (4-6 hours)
- **Phase 3**: Integration (2 hours)
- **Phase 4**: Testing (2-3 hours)
- **Total**: 11-16 hours of implementation

### Incremental Progress
I will use `report_progress` frequently to:
- Commit each logical unit of work
- Update the PR description with progress
- Share screenshots of UI changes
- Allow for early feedback on direction

## Why This Approach

### Benefits of Getting Feedback First
1. ✅ Ensures implementation matches WHO requirements
2. ✅ Avoids rework if assumptions are wrong
3. ✅ Gets buy-in on architecture before coding
4. ✅ Clarifies unclear requirements early
5. ✅ Follows "minimal changes" principle by planning first

### Alignment with Instructions
The issue specifically said:
> "DO NOT IMPLEMENT - propose implementation plan and describe how you will use existing application frameworks (e.g. staging ground)"

This is exactly what I've done:
- ✅ Proposed complete implementation plan
- ✅ Described staging ground integration
- ✅ Described markdown editor approach
- ✅ Described variable substitution framework
- ✅ Identified critical questions before implementation

## Questions or Concerns?

If anything in the implementation plan or architecture is unclear, please comment on:
- The overall approach
- Specific design decisions
- Alternative patterns to consider
- Additional requirements I may have missed

I'm happy to iterate on the design before writing any code.

---

**Status**: 🟡 Awaiting Feedback  
**Ready to Implement**: Yes, once questions are answered  
**Estimated Implementation Time**: 11-16 hours  
**Next Action**: @litlfred please review and provide answers to the 5 critical questions

---

**Thank you for the clear requirements in the issue!** The "propose plan first" approach is exactly right - it ensures we build the right thing the first time. 🎯
