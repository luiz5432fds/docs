# XPS-10 AI Workstation (PT-BR) — Monorepo

Monorepo com:
- App **Flutter Android** (PT-BR, UI estilo workstation/Juno)
- Backend **Firebase** (Auth Google, Firestore, Functions, Storage)
- Regras de segurança (Firestore/Storage)
- CI/CD (deploy Functions + build APK)

## Estrutura

```text
.
├─ app/                  # Flutter app (Android, PT-BR)
├─ functions/            # Cloud Functions (TypeScript)
├─ firebase/             # firestore.rules, storage.rules, indexes
├─ scripts/              # scripts PowerShell (build)
├─ docs/                 # documentação do produto, schema e roadmap
├─ .github/workflows/    # CI/CD (deploy functions + build apk)
└─ firebase.json
```

## Pré-requisitos
- Flutter SDK (stable)
- Node.js 20+
- Firebase CLI:

```bash
npm i -g firebase-tools
```

- Projeto Firebase com:
  - Authentication (Google)
  - Firestore
  - Storage

## Setup Firebase (Android + Google Sign-In)
1. Firebase Console → **Authentication** → Sign-in method → habilite **Google**.
2. Firebase Console → **Project settings** → Your apps → **Android**:
   - defina `applicationId` (ex.: `com.luiz.xps10.aiworkstation`)
   - baixe `google-services.json`
3. Coloque o arquivo em:

```text
app/android/app/google-services.json
```

4. (Opcional recomendado) adicione SHA-1 no Firebase para fluxos Google em alguns dispositivos.
5. No diretório `app/` rode:

```bash
flutter pub get
```

6. Configure FlutterFire (gera `firebase_options.dart`):

```bash
cd app
flutterfire configure --project <FIREBASE_PROJECT_ID>
```

## Deploy de backend (Functions + Rules)

Login e seleção do projeto:

```bash
firebase login
firebase use <FIREBASE_PROJECT_ID>
```

Build e deploy:

```bash
cd functions
npm ci
npm run build
cd ..
firebase deploy --only functions
firebase deploy --only firestore:rules,firestore:indexes,storage
```

## Build APK release

```bash
cd app
flutter pub get
flutter build apk --release
```

APK gerado em:

```text
app/build/app/outputs/flutter-apk/app-release.apk
```

Atalho PowerShell:

```powershell
./scripts/Build-APK.ps1
```

## CI/CD — Service Account (GitHub Actions)

Este repositório usa `GCP_SA_KEY_JSON` e `FIREBASE_PROJECT_ID` nos workflows.

Checklist recomendado:
1. Criar Service Account no GCP para deploy.
2. Conceder permissões mínimas para deploy Firebase (Functions/Rules/Storage conforme uso do projeto).
3. Gerar chave JSON.
4. Configurar secrets no GitHub:
   - `GCP_SA_KEY_JSON`
   - `FIREBASE_PROJECT_ID`

## Recursos implementados

### MVP (obrigatório)
- Login Google obrigatório.
- Home com módulos: gerar timbre, editor, setlists, decoder, comunidade, configurações, assistente, base de conhecimento.
- AI Router com providers:
  - `ProviderFirebaseFunctions` (padrão/fallback)
  - `ProviderLocal` (stub)
  - `ProviderExternal` (stub)
- Cloud Functions MVP:
  - `generatePatch`
  - `runAgents`
  - `evaluatePatch`
  - `searchKB`
  - `likePublicPatch`
  - `onPatchWrite`
  - `onPdfUploaded`

### Fase 2 (catálogos/guias e extensões)
- `mapSemanticDescriptor`
- `getRecipeCatalog`
- `getArticulationIdeas`
- `getSynthesisCodebook`
- `getAdvancedDspPlaybook`
- `getGestureArticulationEngine`
- `getMixReadyPreset`
- `getBrassFmGuide`
- `getRealismToolkit`
- `getXps10ProgrammingGuide`
- `getIntelligentAssistantAlgorithm`
- `getSourceFindingsConsolidation`
- `getVisualArchitecturePlan`

## Limitações conhecidas
- `SysexAdapter` desativado por padrão.
- Decoder de som é aproximação (não clonagem perfeita).

## Mintlify (somente documentação)
Se usar Mintlify neste repositório, garanta `docs.json` na raiz e rode:

```bash
mintlify dev
```

## Documentação técnica
- `docs/PRODUCT.md`
- `docs/SCHEMA.md`
- `docs/ROADMAP.md`
- `docs/MATH_FRAMEWORK_XPS10.md`
- `docs/CODE_CPP_EXAMPLES.md`
- `docs/RECIPE_FAMILIES_XPS10.md`
- `docs/ADVANCED_ARTICULATIONS_XPS10.md`
- `docs/SYNTHESIS_CODEBOOK_XPS10.md`
- `docs/MULTI_LANGUAGE_DSP_RECIPES_XPS10.md`
- `docs/GESTURAL_ARTICULATION_ENGINE_XPS10.md`
- `docs/MIX_READY_PRESETS_XPS10.md`
- `docs/REALISM_SOUND_ENGINE_XPS10.md`
- `docs/XPS10_PROGRAMMING_GUIDE.md`
- `docs/INTELLIGENT_TIMBRE_ALGORITHM.md`
- `docs/SOURCE_FINDINGS_CONSOLIDATION.md`
- `docs/VISUAL_AUDIO_ARCHITECTURE_PLAN.md`
