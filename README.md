# F95Zone Userscript Template

Repository template for building a standalone userscript for F95Zone.

## Template structure

- `/src/main.user.js` - entry userscript file with metadata header
- `/package.json` - lightweight project metadata and syntax-check script

## Usage

1. Edit `/src/main.user.js`:
   - update `@name`, `@namespace`, and `@match`
   - replace the example logic with your own script
2. Build optional tooling around this file as needed.

## Validation

Run a JavaScript syntax check:

```bash
npm test
```
