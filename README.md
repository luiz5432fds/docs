# XPS-10 AI Workstation (PT-BR)

Monorepo com app Flutter (Android), backend Firebase (Auth/Firestore/Functions/Storage), regras de segurança e workflows de CI para deploy/build.

## Estrutura

```text
.
├─ app/                  # Flutter app (PT-BR, UI estilo workstation)
├─ functions/            # Cloud Functions TypeScript
├─ firebase/             # firestore.rules, storage.rules, indexes
├─ scripts/              # scripts PowerShell
├─ docs/                 # documentação de produto, schema e roadmap
├─ .github/workflows/    # CI/CD (deploy functions + build apk)
└─ firebase.json
```


## Pré-requisitos
- Flutter SDK (canal stable)
- Node.js 20+
- Firebase CLI (`npm i -g firebase-tools`)
- Projeto Firebase com Authentication (Google), Firestore e Storage ativos

## Setup Firebase
1. Ative **Google Sign-In** em Authentication.
2. Crie Firestore (modo produção) e Storage.
3. Configure app Android no Firebase Console.
4. No diretório `app/`, rode:
   ```bash
   flutterfire configure
   ```
5. No root do repositório, faça login no Firebase CLI:
   ```bash
   firebase login
   firebase use <FIREBASE_PROJECT_ID>
   ```

## Deploy de backend

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

PowerShell:

```powershell
./scripts/Build-APK.ps1
```

## Documentação técnica
- `docs/PRODUCT.md` visão do produto.
- `docs/SCHEMA.md` schema de dados Firestore.
- `docs/ROADMAP.md` evolução técnica.
- `docs/MATH_FRAMEWORK_XPS10.md` com base matemática de síntese e tradução para controles práticos do XPS-10.
- `docs/CODE_CPP_EXAMPLES.md` com exemplos C++ (oscilador, aditiva, FM, ADSR, ring mod).
- `docs/RECIPE_FAMILIES_XPS10.md` com receitas por famílias e mapa semântico para o XPS-10.
- `docs/ADVANCED_ARTICULATIONS_XPS10.md` com estratégias avançadas de articulação, camadas e realismo.
- `docs/SYNTHESIS_CODEBOOK_XPS10.md` com o codebook consolidado em 5 categorias (FM, granular, waveguide, DAFX, oscilador).
- `docs/MULTI_LANGUAGE_DSP_RECIPES_XPS10.md` com receitas C++/Assembly/MATLAB/BASIC mapeadas para XPS-10.
- `docs/GESTURAL_ARTICULATION_ENGINE_XPS10.md` com mapeamento de aftertouch/pressão por família.
- `docs/MIX_READY_PRESETS_XPS10.md` com cadeia de ganho/presets para saída uniforme no FOH.
- `docs/REALISM_SOUND_ENGINE_XPS10.md` com respostas práticas para aftertouch, EQ de madeiras, jitter/drift e coro 4 tones.
- `docs/XPS10_PROGRAMMING_GUIDE.md` com receitas de Ring Mod, LA, drift e curvas de aftertouch.
- `docs/INTELLIGENT_TIMBRE_ALGORITHM.md` com o pipeline automatizado do assistente (análise → síntese → articulação → mix).
- `docs/SOURCE_FINDINGS_CONSOLIDATION.md` com respostas consolidadas (SysEx/PhISM/drift) e tradução em código para implementação.

## Recursos implementados (MVP)
- Login Google obrigatório.
- Home com módulos: gerar timbre, editor, setlists, decoder, comunidade, configurações, assistente, base de conhecimento.
- AI Router com providers:
  - `ProviderFirebaseFunctions` (padrão/fallback)
  - `ProviderLocal` (stub)
  - `ProviderExternal` (stub)
- Functions:
  - `generatePatch`
  - `runAgents`
  - `evaluatePatch`
  - `likePublicPatch`
  - `searchKB`
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
  - `onPatchWrite`
  - `onPdfUploaded`
- Regras de segurança Firestore/Storage conforme escopo do produto.

## Limitações conhecidas
- `SysexAdapter` permanece desativado por padrão.
- Decoder de som é aproximação (não clonagem perfeita).
- Para deploy real e CI é obrigatório configurar secrets:
  - `GCP_SA_KEY_JSON`
  - `FIREBASE_PROJECT_ID`
