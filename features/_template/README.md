# Feature module template

Copy this folder when adding a new vertical or platform feature.

```
features/<name>/
  api/          # API calls (use shared/lib/api/v1Client)
  components/   # Feature-specific UI
  hooks/        # React hooks
  types/        # TypeScript types
  index.ts      # Public exports
```

## Rules

1. **No cross-feature imports** — share code via `shared/` only.
2. **API v1 first** — use `shared/lib/api/v1Client`; legacy `/api/` only when v1 is not ready.
3. **Pages stay thin** — `app/` routes compose feature components.

## Example

```ts
// features/doctor/api/doctorApi.ts
import v1Client from '@/shared/lib/api/v1Client';

export async function listDoctors() {
  const { data } = await v1Client.get('/doctors/');
  return data;
}
```
