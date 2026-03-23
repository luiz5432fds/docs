# AI Maestro - Sistema de Composição e Produção Musical

O **AI Maestro** é um agente de IA especializado em música brasileira e clássica, com integração profunda com Reaper e MuseScore 4.

## 🎵 Características

### Especialidades Musicais
- **Música Brasileira**: Frevo, Maracatu, Brega, Piseiro, Axé, Calypso, Cumbia, Samba, Choro, Bossa Nova, Baião, Forró, Xaxado, Xote
- **Música Clássica**: Medieval, Renascentista, Barroca, Clássica, Romântica, Moderna, Contemporânea

### Funcionalidades
- **Composição com IA**: Gera MIDI original baseado em padrões de gênero
- **Análise de Áudio**: Detecta BPM, key, duração usando librosa
- **Download do YouTube**: Baixa referências musicais para análise
- **Integração Reaper**: Gera projetos .rpp e scripts ReaScript
- **Integração MuseScore**: Exporta MusicXML para notação
- **RAG (Retrieval-Augmented Generation)**: Consulta base de conhecimento de PDFs técnicos

## 📁 Estrutura do Projeto

```
├── treinar_maestro.py        # Treina o cérebro RAG com PDFs
├── estudio_master.py         # Aplicação principal (CLI)
├── midi_composer.py          # Serviço de composição MIDI
├── notebooklm_integration.py # Integração com NotebookLM
├── ai_maestro_service.py     # API REST (FastAPI)
├── requirements.txt          # Dependências Python
├── .env.example              # Variáveis de ambiente
├── meus_livros/              # Seus PDFs para treinamento
├── cerebro_faiss/            # Índice vetorial FAISS (gerado)
└── projetos/                 # Projetos gerados (MIDI, .rpp, .musicxml)
```

## 🚀 Instalação

### 1. Instalar dependências

```bash
pip install -r requirements.txt
```

### 2. Configurar API Key

Edite `.env` ou exporte a variável:

```bash
export GOOGLE_API_KEY="sua_chave_aqui"
```

Obtenha sua chave em: https://makersuite.google.com/app/apikey

### 3. Preparar biblioteca de PDFs

Coloque seus PDFs técnicos na pasta `meus_livros/`:

- Manuais de sintetizadores (XPS-10, Juno, etc.)
- Guias de Reaper
- Teoria musical
- História da música brasileira
- Orquestração

### 4. Treinar o AI Maestro

```bash
python treinar_maestro.py
```

Isso processa todos os PDFs e cria o índice FAISS em `cerebro_faiss/`.

## 💻 Uso

### Interface CLI

```bash
python estudio_master.py
```

Comandos disponíveis:
- `ask <pergunta>` - Faça uma pergunta sobre música
- `genre <gênero>` - Informações sobre gênero brasileiro
- `classical <período>` - Informações sobre período clássico
- `setup <gênero>` - Cria projeto Reaper
- `download <url>` - Baixa e analisa áudio do YouTube

### API REST

Inicie o servidor:

```bash
python ai_maestro_service.py
```

A API estará disponível em `http://localhost:8000`

#### Endpoints Principais

**POST /compose** - Gerar composição
```json
{
  "genre": "samba",
  "tempo": 110,
  "key": "C",
  "length_bars": 32,
  "mood": "festive",
  "title": "Meu Samba"
}
```

**POST /analyze** - Analisar áudio do YouTube
```json
{
  "youtube_url": "https://youtube.com/watch?v=..."
}
```

**POST /query** - Consultar AI Maestro
```json
{
  "question": "Qual a instrumentação típica do Frevo?",
  "context": "Produção musical pernambucana"
}
```

**POST /project/create** - Criar projeto completo
```json
{
  "name": "Meu Projeto",
  "genre": "maracatu",
  "tempo": 120,
  "key": "C"
}
```

## 🎼 Exemplos de Uso

### Gerar um Choro

```python
from midi_composer import AIComposer, Genre

composer = AIComposer()
composition = composer.generate_composition(
    genre=Genre.CHORO,
    tempo=90,
    key="C",
    length_bars=48,
    mood="nostalgic"
)

composer.composition_to_midi(composition, "choro_generated.mid")
```

### Criar projeto de Samba para Reaper

```python
from estudio_master import AIMaestro

maestro = AIMaestro()
result = maestro.get_reaper_setup("samba")

print(f"Projeto: {result['project_file']}")
print(f"Script: {result['setup_script']}")
print(f"Instrumentos: {result['instruments']}")
```

### Analisar música do YouTube

```python
from estudio_master import AIMaestro

maestro = AIMaestro()
analysis = maestro.download_and_analyze(
    "https://youtube.com/watch?v=..."
)

print(f"BPM: {analysis.bpm}")
print(f"Key: {analysis.key}")
```

## 📚 Gêneros Suportados

| Gênero | Origem | BPM | Características |
|--------|--------|-----|-----------------|
| Frevo | Pernambuco | 130-145 | Metais, march-like, virtuoso |
| Maracatu | Pernambuco | 110-125 | Tambores pesados, call-response |
| Samba | Rio de Janeiro | 100-120 | Percussão, sincopado |
| Choro | Rio de Janeiro | 85-100 | Virtuoso, contrapontístico |
| Bossa Nova | Rio de Janeiro | 110-130 | Suave, jazz-influenced |
| Brega | Pará/Norte | 85-105 | Romântico, eletrônico |
| Piseiro | Piauí | 135-160 | Muito rápido, dançante |
| Axé | Bahia | 95-115 | Afro-beat, carnaval |
| Baião | Nordeste | 90-110 | Sanfona, baião rhythm |

## 🔧 Integração com Flutter

O app Flutter pode se conectar à API via HTTP:

```dart
// Exemplo em Dart
final response = await http.post(
  Uri.parse('http://localhost:8000/compose'),
  headers: {'Content-Type': 'application/json'},
  body: jsonEncode({
    'genre': 'samba',
    'tempo': 110,
    'key': 'C',
    'length_bars': 32,
  }),
);

final midiUrl = jsonDecode(response.body)['download_url'];
```

## 📖 Referências

- [LangChain Documentation](https://python.langchain.com/)
- [Google Generative AI](https://ai.google.dev/)
- [librosa - Audio Analysis](https://librosa.org/)
- [ReaScript Documentation](https://www.reaper.fm/sdk/reascript/reascript.php)
- [MusicXML Specification](https://www.musicxml.com/)

## 🤝 Contribuindo

Para adicionar novos gêneros ou funcionalidades:

1. Edite `midi_composer.py` - Adicione ao `Genre` enum e `GENRE_CONFIGS`
2. Edite `estudio_master.py` - Adicione instrumentação em `INSTRUMENT_TEMPLATES`
3. Execute `treinar_maestro.py` após adicionar novos PDFs

## 📝 Licença

Este projeto faz parte do XPS-10 AI Workstation.

---

**AI Maestro** - Seu parceiro para composição e produção musical brasileira! 🎺🎸
