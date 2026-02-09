# JSON Schema for Song Files

## Overview

The song JSON files in `public/songs/` now have full IDE support with autocomplete, validation, and inline documentation.

## How It Works

1. **TypeScript Interfaces** (`src/app/models/*.ts`) - Source of truth for the song format
2. **JSON Schema** (`public/songs/song.schema.json`) - Auto-generated from TypeScript
3. **Song Files** - Reference the schema via `$schema` property

## Usage

### Editing Songs in Your IDE

When you open any `.json` file in `public/songs/`, your IDE will:
- Provide **autocomplete** for all properties
- Show **inline documentation** from TypeScript comments
- **Validate** the structure in real-time
- Highlight **errors** immediately

### Regenerating the Schema

Whenever you modify the TypeScript interfaces, regenerate the schema:

```bash
npm run generate:schema
```

This ensures the JSON schema stays in sync with your TypeScript definitions.

### Adding the Schema to New Songs

Add this as the first line in any new song JSON file:

```json
{
  "$schema": "./song.schema.json",
  "title": "My New Song",
  ...
}
```

## Benefits

✅ **No sync issues** - Schema is generated from TypeScript, not manually maintained  
✅ **IDE support** - Full autocomplete and validation  
✅ **Documentation** - JSDoc comments appear as hints in your editor  
✅ **Type safety** - Catch errors before runtime  

## Files

- `package.json` - Contains `generate:schema` script
- `public/songs/song.schema.json` - Generated schema (do not edit manually)
- `public/songs/*.json` - Song files with `$schema` reference
