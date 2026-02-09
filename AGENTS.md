# Agent Guidelines for Angular ToneJS Sequencer

## Core Principles

### 1. Use Angular CLI MCP Best Practices
- Use best practices from `angular-cli get_best_practices`.

### 2. Type Safety First
- **NEVER use `any` type unless absolutely stuck**
  - Current exceptions: Two uses in `audio-builder.service.ts` where ToneJS type definitions have mismatches
  - Before using `any`, exhaust all other options:
    - Use ToneJS built-in types (`Tone.*Options`, `Tone.*Type`, etc.)
    - Use TypeScript utility types (`Partial<T>`, `Omit<T>`, `Pick<T>`)
    - Use generic constraints
    - Use union types
    - Create minimal interface definitions only when ToneJS doesn't provide them
- **Prefer undefined over null **

### 3. Leverage ToneJS Types
- **Always prefer ToneJS native types over custom definitions**
  - Effects: Use `Partial<Tone.ReverbOptions>`, `Partial<Tone.DelayOptions>`, etc.
  - Oscillators: Use `Tone.ToneOscillatorType` instead of string literals
  - Envelopes: Use `Partial<Tone.EnvelopeOptions>` instead of custom interfaces
  - Time: Use ToneJS time notation (bar:beat:sixteenth format)
- **Import from ToneJS properly**
  - `import * as Tone from 'tone';` for namespace import
  - Access types via `Tone.*` namespace
- **Consult ToneJS documentation** when uncertain about types
  - ToneJS has excellent TypeScript definitions
  - Most classes expose their options as `*Options` interfaces

## Architecture Patterns

### Service Layer
- **AudioBuilderService**: Converts typed models to ToneJS instances
  - Handles all `new Tone.*()` constructor calls
  - Manages ToneJS type casting when necessary
  - Single responsibility: model-to-audio conversion

- **SequencerService**: Orchestrates playback and state
  - Uses AudioBuilderService for instance creation
  - Manages Transport and scheduling
  - Maintains reactive state with signals

### Model Layer
- **Separate model files by domain**
  - `effects.model.ts`: Effect type definitions
  - `instruments.model.ts`: Instrument and generator types
  - `song.model.ts`: Core song structure
- **Use discriminated unions for polymorphic types**
  - `type Effect = ReverbEffect | DelayEffect | ...`
  - Each has `type` discriminator for type narrowing

### Component Layer
- **OnPush change detection by default**
- **Use signals for reactive state**
- **Computed signals for derived values**
- **Effects for side effects (like auto-scrolling)**

## Code Quality Standards

### When Adding New Features
1. **Check ToneJS documentation first** - see if the type already exists
2. **Use Angular CLI generators** - don't manually create files
3. **Update models with proper types** - extend ToneJS types when possible
4. **Build incrementally** - test after each change
5. **Keep services focused** - single responsibility principle

### When Encountering Type Issues
1. **Read the ToneJS error message carefully** - it usually indicates the expected type
2. **Check ToneJS source definitions** - they're well-documented
3. **Try TypeScript utility types** - `Partial<T>`, `RecursivePartial<T>`, `Omit<T>`
4. **Only use `any` as last resort** - document why it's necessary with a comment

### File Organization
```
src/app/
├── models/           # Type definitions (extend ToneJS types)
├── services/         # Business logic (inject dependencies, use types)
├── components/       # UI (generated via ng CLI)
└── app.config.ts     # Application configuration
```

## Common Patterns

### Creating New Effect Types
```typescript
// ✅ GOOD: Extend ToneJS options
export interface NewEffectEffect {
  type: 'newEffect';
  options?: Partial<Tone.NewEffectOptions>;
}

// ❌ BAD: Custom parameters
export interface NewEffectEffect {
  type: 'newEffect';
  intensity: number;
  mix: number;
}
```

### Using Angular CLI
```bash
# ✅ GOOD: Use generators
ng generate component my-feature
ng generate service my-service

# ❌ BAD: Manual file creation
touch src/app/components/my-feature.component.ts
```

### Type Safety
```typescript
// ✅ GOOD: Use ToneJS types
oscillatorType?: Tone.ToneOscillatorType;

// ❌ BAD: String literal
oscillatorType?: string;

// ✅ GOOD: Extend ToneJS options
envelope?: Partial<Tone.EnvelopeOptions>;

// ❌ BAD: Custom interface
envelope?: {
  attack: number;
  decay: number;
  sustain: number;
  release: number;
}
```

## Current Technical Debt
- Two uses of `any` type in `audio-builder.service.ts` (lines where ToneJS type definitions mismatch)
- Could be resolved by contributing fixes to ToneJS type definitions

## Future Considerations
- When adding new ToneJS features, always check for existing type definitions first
- Consider contributing type definition improvements back to ToneJS if mismatches are found
- Keep models in sync with ToneJS API changes by using their types directly
