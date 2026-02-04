# Usage

## CRITICAL RULES

### 1. Action Schema - User's Words Only
When user provides an image with their request, **ONLY use fields they explicitly mention in text**.
- User says: "Input: nsn, quantity. Output: comment." + shows image with 10 fields
- **CORRECT**: Schema has only `nsn`, `quantity` as inputs, `comment` as output
- **WRONG**: Extract all 10 fields from image

### 2. Protected Files - Do Not Modify
| File | Reason |
|------|--------|
| `src/hooks/useActionContext.ts` | Action Center integration |
| `src/lib/uipath.ts` | UiPath SDK config |
| `src/components/action/*` | Pre-built components |
| `src/types/action-schema.ts` | Type definitions |

**ONLY modify:** `src/pages/ActionPage.tsx` and `action-schema.json`

### 3. Wait for Action Center Data Before API Calls
```typescript
const { formData, hasActionCenterData } = useActionContext({ initialData: INITIAL_DATA });

// WRONG - fails with mock data
useEffect(() => {
  fetchDocuments(formData.bucketId);
}, [formData.bucketId]);

// CORRECT - wait for real data
useEffect(() => {
  if (!hasActionCenterData) return;
  fetchDocuments(formData.bucketId);
}, [hasActionCenterData, formData.bucketId]);
```

---

## Action Schema (action-schema.json)

```json
{
  "inputs": {
    "type": "object",
    "properties": {
      "applicantName": { "type": "string", "required": true }
    }
  },
  "outputs": {
    "type": "object",
    "properties": {
      "reviewerComments": { "type": "string" }
    }
  },
  "inOuts": { "type": "object", "properties": {} },
  "outcomes": {
    "type": "object",
    "properties": {
      "Approve": { "type": "string" },
      "Reject": { "type": "string" }
    }
  }
}
```

| Category | Description | Editable |
|----------|-------------|----------|
| `inputs` | Read-only data from automation | No |
| `outputs` | Data user must provide | Yes |
| `inOuts` | Pre-filled, user can edit | Yes |
| `outcomes` | Decision buttons | N/A |

**Types:** `string`, `number`, `integer`, `boolean`, `date`

**Rules:** Use camelCase. Always have at least one outcome. Never use `result` as field name.

---

## useActionContext Hook

```typescript
import { useActionContext } from '@/hooks/useActionContext';

export function ActionPage() {
  const {
    formData,              // Form state (inputs + outputs + inOuts)
    isReadOnly,            // Task completed?
    hasActionCenterData,   // Real data received?
    updateField,           // Update field: updateField('name', value)
    completeTask,          // Complete: completeTask('Approve')
  } = useActionContext({
    initialData: { applicantName: 'Test', loanAmount: 25000 }
  });

  return (
    <div>
      {!hasActionCenterData && <div>Preview Mode</div>}
      <p>{formData.applicantName}</p>
      <input
        value={formData.comments || ''}
        onChange={(e) => updateField('comments', e.target.value)}
        disabled={isReadOnly}
      />
      <button onClick={() => completeTask('Approve')}>Approve</button>
    </div>
  );
}
```

---

## Pre-built Components

### OutcomeButtons
```typescript
import { OutcomeButtons } from '@/components/action';
<OutcomeButtons outcomes={['Approve', 'Reject']} onOutcome={completeTask} disabled={!isValid} />
```

### ActionFormField
```typescript
import { ActionFormField } from '@/components/action';

// Single-line text input
<ActionFormField name="email" label="Email" type="string" value={formData.email} onChange={(v) => updateField('email', v)} />

// Multi-line textarea (use for comments, feedback, descriptions, etc.)
<ActionFormField name="comments" label="Comments" type="string" multiline={true} value={formData.comments} onChange={(v) => updateField('comments', v)} />
```

### ReadOnlyField
```typescript
import { ReadOnlyField } from '@/components/action';
<ReadOnlyField label="Applicant" value={formData.applicantName} />
```

### PDFViewer
```typescript
import { PDFViewer } from '@/components/action';
<PDFViewer file={pdfUrl} maxHeight={500} showControls={true} />
```

**Do NOT use `<iframe>`, `<object>`, or `<embed>` for PDFs** - they're blocked in Action Center's sandbox.

---

## Entity Records

```typescript
const { records, fetchByName } = useEntityRecords();

useEffect(() => {
  if (!hasActionCenterData) return;  // Wait for SDK init
  fetchByName(formData.entityName);
}, [hasActionCenterData, formData.entityName]);
```

**Record structure is flat** - access fields directly:
```typescript
// CORRECT
record.name, record.email

// WRONG - these don't exist
record.properties?.name, record.data?.name
```

**IMPORTANT: Always use `formatCellValue()` for ALL table cells.** Entity record fields can be strings, numbers, booleans, arrays, or nested objects. Rendering them directly shows raw JSON for objects. Always wrap every cell value:
```typescript
// WRONG - objects render as {"id":"..."}, arrays as "[object Object]"
<td>{record.someField}</td>

// CORRECT - handles all types properly
<td>{formatCellValue(record.someField)}</td>
```

---

## Common Patterns

### Referential Stability (Prevent Infinite Loops)
```typescript
// Arrays - memoize
const paths = useMemo(() => [a, b, c].filter(Boolean), [a, b, c]);

// Functions - useCallback
const handleClick = useCallback(() => doSomething(id), [id]);

// One-time fetch - use guard
const hasFetchedRef = useRef(false);
useEffect(() => {
  if (hasFetchedRef.current) return;
  hasFetchedRef.current = true;
  fetchData();
}, []);
```

### Content Type Detection
Bucket paths may not have extensions. Use MIME type from blob:
```typescript
function getContentType(path: string, mimeType?: string): 'image' | 'pdf' | 'text' | 'unknown' {
  if (mimeType) {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType === 'application/pdf') return 'pdf';
    if (mimeType.startsWith('text/')) return 'text';
  }
  const ext = path.split('.').pop()?.toLowerCase();
  if (['jpg','jpeg','png','gif','webp','svg','bmp'].includes(ext || '')) return 'image';
  if (ext === 'pdf') return 'pdf';
  if (['txt','md','json','xml','csv'].includes(ext || '')) return 'text';
  return 'unknown';
}

// When fetching:
const blob = await response.blob();
const contentType = getContentType(path, blob.type);  // Pass MIME type!
```

### Format Cell Values for Tables
**ALWAYS define and use this helper when displaying entity records in tables:**
```typescript
function formatCellValue(value: unknown): string {
  if (value == null) return '-';
  if (Array.isArray(value)) return value.length <= 3 ? value.join(', ') : `${value.length} items`;
  if (typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    // Extract readable property from nested objects
    return String(obj.displayName || obj.name || obj.title || obj.label || obj.id || JSON.stringify(obj).slice(0, 50));
  }
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  return String(value);
}
```

**Use for EVERY cell in entity record tables - not just specific fields:**
```typescript
{records.map((record) => (
  <tr key={record.id}>
    {Object.entries(record).map(([key, value]) => (
      <td key={key}>{formatCellValue(value)}</td>
    ))}
  </tr>
))}

// Or for specific columns:
<tr>
  <td>{formatCellValue(record.name)}</td>
  <td>{formatCellValue(record.status)}</td>
</tr>
```

### Layout Constraints
```typescript
// WRONG - content overflows
<PDFViewer file={url} />

// CORRECT - bounded container
<div className="max-h-[600px] overflow-auto">
  <PDFViewer file={url} />
</div>
```

---

## File Structure

```
├── action-schema.json          # Define inputs/outputs/outcomes
├── src/
│   ├── pages/ActionPage.tsx    # Main UI (customize this)
│   ├── hooks/useActionContext.ts   # (do not modify)
│   ├── lib/uipath.ts              # (do not modify)
│   ├── components/action/         # (do not modify)
│   └── types/action-schema.ts     # (do not modify)
```

---

## Checklist

**DO:**
- Create `action-schema.json` matching user's requirements
- Use `hasActionCenterData` guard before API calls
- Wrap arrays/objects in `useMemo` when passing to hooks
- Use `PDFViewer` component for PDFs
- Detect content type from MIME type, not just path
- Format complex objects before displaying
- Use separate useEffects for blob URL creation and cleanup

**DON'T:**
- Add fields to schema that user didn't specify
- Modify protected files
- Use `<iframe>`/`<object>`/`<embed>` for PDFs
- Create inline arrays in hook dependencies
- Assume all documents are the same type
- Render entity record fields directly in table cells - always use `formatCellValue()`
- Include blob URL state in the same useEffect that creates it (causes infinite loops)