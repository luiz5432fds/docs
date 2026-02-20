# XPS-10 AI Workstation (PT-BR) — Monorepo

Monorepo contendo:

- App Flutter Android (PT-BR, UI estilo Roland Juno Editor / workstation)
- Backend Firebase (Authentication Google, Firestore, Cloud Functions, Storage)
- Regras de segurança
- CI/CD via GitHub Actions
- Base de conhecimento com ingestão de PDF
- Motor multi-IA concorrente

---

## Estrutura do projeto

```text
.
├─ app/                  # Flutter app Android (PT-BR)
├─ functions/            # Cloud Functions TypeScript
├─ firebase/             # firestore.rules, storage.rules, indexes
├─ scripts/              # scripts PowerShell (build)
├─ docs/                 # documentação técnica e arquitetura
├─ .github/workflows/    # CI/CD
└─ firebase.json
```

## Pré-requisitos

Instalar:

- Flutter SDK (stable)
- Node.js 20+
- Firebase CLI

```bash
npm install -g firebase-tools
```

Criar projeto Firebase com:

- Authentication (Google)
- Firestore
- Storage

## Setup Firebase (Android)

1. Firebase Console → Authentication → habilitar Google.
2. Firebase Console → Project Settings → Your Apps → Android.
3. Definir:
   - `applicationId: com.luiz.xps10.aiworkstation`
4. Baixar:
   - `google-services.json`
5. Colocar em:

```text
app/android/app/google-services.json
```

6. No diretório `app`:

```bash
cd app
flutter pub get
flutterfire configure --project <FIREBASE_PROJECT_ID>
```

## Deploy backend

Login:

```bash
firebase login
firebase use <FIREBASE_PROJECT_ID>
```

Deploy Functions:

```bash
cd functions
npm ci
npm run build
cd ..
firebase deploy --only functions
```

Deploy rules:

```bash
firebase deploy --only firestore:rules,firestore:indexes,storage
```

## Build APK

```bash
cd app
flutter pub get
flutter build apk --release
```

APK gerado em:

```text
app/build/app/outputs/flutter-apk/app-release.apk
```

Ou via PowerShell:

```powershell
./scripts/Build-APK.ps1
```

## CI/CD (GitHub Actions)

Configurar secrets:

- `GCP_SA_KEY_JSON`
- `FIREBASE_PROJECT_ID`

### Service Account (recomendado para deploy)

1. No Google Cloud, crie uma Service Account dedicada para CI/CD.
2. Conceda privilégios mínimos para deploy Firebase (ex.: Cloud Functions Admin, Firebase Admin, Service Account User).
3. Gere chave JSON e salve em `GCP_SA_KEY_JSON` (GitHub Secrets).
4. Configure `FIREBASE_PROJECT_ID` com o ID do projeto Firebase.

Workflows:

- deploy functions automático (com validação de secrets e build TypeScript)
- build APK automático (Java 17 + Flutter stable)

## Recursos implementados

### MVP

App:

- Login Google obrigatório
- Editor estilo Roland Juno Editor
- Motor de geração de timbres
- Assistente multi-IA concorrente
- Setlists
- Base de conhecimento (PDF ingest)
- Comunidade de patches

Providers:

- `ProviderFirebaseFunctions`
- `ProviderLocal` (stub)
- `ProviderExternal` (stub)

Functions MVP:

- `generatePatch`
- `runAgents`
- `evaluatePatch`
- `searchKB`
- `likePublicPatch`
- `onPatchWrite`
- `onPdfUploaded`

### Fase 2 (expansão)

Functions adicionais:

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

- `SysexAdapter` desativado por padrão
- Decoder de som é aproximação
- IA embarcada ainda é stub
- Secrets obrigatórios para CI/CD

## Documentação técnica

Ver:

- `docs/PRODUCT.md`
- `docs/SCHEMA.md`
- `docs/ROADMAP.md`
- `docs/INTELLIGENT_TIMBRE_ALGORITHM.md`
- `docs/XPS10_PROGRAMMING_GUIDE.md`
- `docs/XPS10_GUARDRAILS.md` guardrails operacionais (USB/backup/polyphony/sync/samples).

## Ordem recomendada de execução

1. Setup Firebase Console
2. `flutterfire configure`
3. `firebase deploy functions`
4. `flutter build apk`
5. Instalar APK no dispositivo
