# Firestore Schema

## Coleções principais

### `devices/roland-xps10`
- `name`: string
- `vendor`: "Roland"
- `supportsSysex`: bool (false default)
- `panelControls`: map

### `users/{uid}`
- `displayName`, `email`, `photoUrl`
- `createdAt`, `updatedAt`

### `users/{uid}/patches/{patchId}`
- `name`: string
- `category`: string
- `tags`: string[]
- `deviceId`: string (`roland-xps10`)
- `isPublic`: bool
- `version`: number
- `favorite`: bool
- `createdAt`, `updatedAt`: timestamp
- `macro`: `{brightness,bite,warmth,width,dirt,air}` (0..100)
- `panel`: `{cutoff,resonance,attack,release,chorus,reverb}` (0..127)
- `fxPlan`: string[]
- `mixHints`: string[]
- `contextDefaults`: map
- `midiPlan`: map
- `ai`: map (resultados de decode/aproximação)

### `users/{uid}/patches/{patchId}/generated/variants/current`
- `recipeSteps`: string[]
- `variants`: map `{verso,refrão,solo}`

### `users/{uid}/setlists/{setlistId}`
- `name`, `description`
- `createdAt`, `updatedAt`

### `users/{uid}/setlists/{setlistId}/items/{itemId}`
- `title`, `patchId`, `notes`, `order`

### `publicPatches/{patchId}`
Espelho de patch público criado/atualizado via Cloud Functions.

### `kb_docs/{docId}`
- `uid`, `fileName`, `storagePath`, `status`
- `charCount`, `createdAt`, `updatedAt`

### `kb_chunks/{chunkId}`
- `uid`, `docId`, `chunkIndex`, `content`, `keywords[]`, `createdAt`
