#!/usr/bin/env python3
"""
ai_maestro_service.py - Serviço HTTP para o AI Maestro

API REST para integração com o app Flutter.
Expõe endpoints para composição, análise de áudio, e consultas RAG.
"""

import os
import sys
import json
import asyncio
from pathlib import Path
from typing import List, Dict, Any, Optional
from datetime import datetime
import hashlib

# Web framework
from fastapi import FastAPI, HTTPException, UploadFile, File, BackgroundTasks
from fastapi.responses import JSONResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import uvicorn

# AI Maestro components
from midi_composer import AIComposer, Genre, Composition
from estudio_master import AIMaestro, YouTubeDownloader, AudioAnalyzer, ReaperProjectGenerator, MuseScoreExporter
from notebooklm_integration import NotebookLMClient, MusicKnowledgeBase

# Configuration
API_HOST = os.environ.get("AI_MAESTRO_HOST", "0.0.0.0")
API_PORT = int(os.environ.get("AI_MAESTRO_PORT", "8000"))
PROJECTS_DIR = Path("projetos")
TEMP_DIR = Path("temp")
FAISS_DIR = Path("cerebro_faiss")

# Initialize directories
for dir_path in [PROJECTS_DIR, TEMP_DIR]:
    dir_path.mkdir(exist_ok=True)

# Initialize FastAPI
app = FastAPI(
    title="AI Maestro API",
    description="Serviço de composição e produção musical com IA especializado em música brasileira e clássica",
    version="1.0.0"
)

# Add CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize components
maestro = AIMaestro()
composer = AIComposer()
youtube = YouTubeDownloader()
analyzer = AudioAnalyzer()

# Pydantic models for API

class ComposeRequest(BaseModel):
    """Request para composição"""
    genre: str = Field(..., description="Gênero musical")
    tempo: Optional[int] = Field(None, description="BPM (auto se não especificado)")
    key: str = Field("C", description="Tonalidade")
    length_bars: int = Field(32, description="Duração em compassos")
    mood: str = Field("neutral", description="Clima desejado")
    title: Optional[str] = Field(None, description="Título da composição")

class AnalysisRequest(BaseModel):
    """Request para análise de áudio"""
    youtube_url: str = Field(..., description="URL do YouTube")

class ProjectRequest(BaseModel):
    """Request para criação de projeto"""
    name: str = Field(..., description="Nome do projeto")
    genre: str = Field(..., description="Gênero musical")
    tempo: Optional[int] = Field(None, description="BPM")
    key: str = Field("C", description="Tonalidade")

class QueryRequest(BaseModel):
    """Request para consulta ao AI Maestro"""
    question: str = Field(..., description="Pergunta")
    context: Optional[str] = Field(None, description="Contexto adicional")

class ArrangementRequest(BaseModel):
    """Request para sugestão de arranjo"""
    genre: str = Field(..., description="Gênero musical")
    mood: Optional[str] = Field(None, description="Clima desejado")
    instruments: Optional[List[str]] = Field(None, description="Lista de instrumentos")

class TechniqueRequest(BaseModel):
    """Request para explicação de técnica"""
    technique: str = Field(..., description="Nome da técnica")
    context: Optional[str] = Field(None, description="Contexto")

# API Routes

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": "AI Maestro API",
        "version": "1.0.0",
        "status": "running",
        "components": {
            "rag_trained": maestro.vector_store is not None,
            "notebooklm": hasattr(maestro, 'notebooklm'),
        },
        "supported_genres": [g.value for g in Genre],
    }


@app.get("/health")
async def health():
    """Health check"""
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}


@app.get("/genres")
async def get_genres():
    """Lista todos os gêneros suportados"""
    genres = {
        "brazilian": [
            {"id": "frevo", "name": "Frevo", "origin": "Pernambuco", "tempo_range": (130, 145)},
            {"id": "maracatu", "name": "Maracatu", "origin": "Pernambuco", "tempo_range": (110, 125)},
            {"id": "samba", "name": "Samba", "origin": "Rio de Janeiro", "tempo_range": (100, 120)},
            {"id": "choro", "name": "Choro", "origin": "Rio de Janeiro", "tempo_range": (85, 100)},
            {"id": "bossa_nova", "name": "Bossa Nova", "origin": "Rio de Janeiro", "tempo_range": (110, 130)},
            {"id": "brega", "name": "Brega", "origin": "Pará/Brasil", "tempo_range": (85, 105)},
            {"id": "piseiro", "name": "Piseiro", "origin": "Piauí", "tempo_range": (135, 160)},
            {"id": "axe", "name": "Axé", "origin": "Bahia", "tempo_range": (95, 115)},
            {"id": "calypso", "name": "Calypso", "origin": "Caribbean/Pará", "tempo_range": (105, 120)},
            {"id": "cumbia", "name": "Cumbia", "origin": "Colômbia/América Latina", "tempo_range": (90, 105)},
            {"id": "baiao", "name": "Baião", "origin": "Nordeste", "tempo_range": (90, 110)},
            {"id": "forro", "name": "Forró", "origin": "Nordeste", "tempo_range": (100, 130)},
        ],
        "classical": [
            {"id": "baroque", "name": "Baroque", "period": "1600-1750"},
            {"id": "classical", "name": "Classical", "period": "1750-1820"},
            {"id": "romantic", "name": "Romantic", "period": "1820-1900"},
            {"id": "modern", "name": "Modern/Contemporary", "period": "1900-present"},
        ]
    }
    return genres


@app.post("/compose")
async def compose(request: ComposeRequest, background_tasks: BackgroundTasks):
    """
    Gera uma composição musical

    Retorna URL para download do arquivo MIDI gerado.
    """
    try:
        # Parse genre
        genre = Genre(request.genre.lower())

        # Generate composition
        composition = composer.generate_composition(
            genre=genre,
            tempo=request.tempo,
            key=request.key,
            length_bars=request.length_bars,
            mood=request.mood
        )

        # Set title
        if request.title:
            composition.title = request.title

        # Generate filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        safe_title = "".join(c if c.isalnum() or c in (' ', '-', '_') else '_' for c in composition.title)
        filename = f"{safe_title}_{timestamp}.mid"
        output_path = PROJECTS_DIR / filename

        # Export MIDI
        composer.composition_to_midi(composition, output_path)

        return {
            "success": True,
            "composition": {
                "title": composition.title,
                "genre": composition.genre.value,
                "tempo": composition.tempo,
                "time_signature": f"{composition.time_signature[0]}/{composition.time_signature[1]}",
                "key": composition.key,
                "num_notes": len(composition.notes),
            },
            "download_url": f"/download/{filename}",
            "filename": filename
        }

    except ValueError:
        raise HTTPException(status_code=400, detail=f"Gênero não suportado: {request.genre}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/analyze")
async def analyze(request: AnalysisRequest):
    """
    Baixa e analisa áudio do YouTube

    Retorna BPM, key, duração e outras características.
    """
    try:
        # Download audio
        audio_path = youtube.download(request.youtube_url)
        if not audio_path:
            raise HTTPException(status_code=400, detail="Não foi possível baixar o áudio")

        # Analyze
        analysis = analyzer.analyze(audio_path)

        return {
            "success": True,
            "analysis": {
                "bpm": round(analysis.bpm, 1),
                "key": analysis.key,
                "duration": round(analysis.duration, 1),
                "spectral_centroid": round(analysis.spectral_centroid, 2),
                "onset_count": len(analysis.onset_times),
            },
            "audio_file": str(audio_path.name)
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/project/create")
async def create_project(request: ProjectRequest):
    """
    Cria projeto completo (Reaper + MuseScore)

    Retorna arquivos de projeto prontos para abrir.
    """
    try:
        # Parse genre
        genre = request.genre.lower()

        # Create project
        reaper_gen = ReaperProjectGenerator(request.name)
        musescore_gen = MuseScoreExporter(request.name)

        from estudio_master import ProjectInfo

        project_info = ProjectInfo(
            name=request.name,
            tempo=request.tempo,
            key=request.key,
            style=genre,
        )

        # Setup for genre
        result = reaper_gen.setup_for_genre(genre)

        # Generate MusicXML
        xml_path = musescore_gen.generate_musicxml(project_info)

        return {
            "success": True,
            "project": {
                "name": request.name,
                "genre": genre,
                "tempo": result.get("tempo", 120),
                "instruments": result.get("instruments", []),
            },
            "files": {
                "reaper_project": result.get("project_file"),
                "reaper_script": result.get("setup_script"),
                "musescore_xml": str(xml_path),
            }
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/query")
async def query(request: QueryRequest):
    """
    Faz uma pergunta ao AI Maestro (RAG)

    Retorna resposta baseada nos documentos treinados.
    """
    try:
        if not maestro.vector_store:
            raise HTTPException(
                status_code=503,
                detail="AI Maestro não está treinado. Execute treinar_maestro.py primeiro."
            )

        # Add context if provided
        question = request.question
        if request.context:
            question = f"{request.context}\n\nPergunta: {request.question}"

        answer = maestro.ask(question)

        return {
            "success": True,
            "question": request.question,
            "answer": answer
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/arrange/suggest")
async def suggest_arrangement(request: ArrangementRequest):
    """
    Sugere arranjo para um gênero específico

    Retorna instrumentação, harmonia, rhythm suggestions.
    """
    try:
        if not maestro.vector_store:
            raise HTTPException(
                status_code=503,
                detail="AI Maestro não está treinado."
            )

        instruments = request.instruments or []
        mood = request.mood or ""

        suggestion = maestro.suggest_arrangement(
            genre=request.genre,
            mood=mood,
            instruments=instruments
        )

        return {
            "success": True,
            "genre": request.genre,
            "mood": mood,
            "instruments": instruments,
            "suggestion": suggestion
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail(str(e)))


@app.post("/technique/explain")
async def explain_technique(request: TechniqueRequest):
    """
    Explica uma técnica musical

    Retorna explicação detalhada com exemplos.
    """
    try:
        if not maestro.vector_store:
            raise HTTPException(
                status_code=503,
                detail="AI Maestro não está treinado."
            )

        explanation = maestro.explain_technique(
            technique=request.technique,
            context=request.context
        )

        return {
            "success": True,
            "technique": request.technique,
            "context": request.context,
            "explanation": explanation
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/download/{filename}")
async def download_file(filename: str):
    """Download de arquivo gerado"""
    file_path = PROJECTS_DIR / filename

    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Arquivo não encontrado")

    return FileResponse(
        path=file_path,
        media_type="audio/midi" if filename.endswith(".mid") else "application/octet-stream",
        filename=filename
    )


@app.get("/projects")
async def list_projects():
    """Lista todos os projetos criados"""
    projects = []

    for path in PROJECTS_DIR.iterdir():
        if path.is_file():
            stat = path.stat()
            projects.append({
                "name": path.name,
                "size": stat.st_size,
                "created": datetime.fromtimestamp(stat.st_ctime).isoformat(),
            })

    return {"projects": sorted(projects, key=lambda p: p["created"], reverse=True)}


# Background task for training

@app.post("/train")
async def train_maestro(background_tasks: BackgroundTasks):
    """
    Inicia treinamento do AI Maestro

    Processa PDFs e cria índice FAISS.
    """
    def run_training():
        import subprocess
        subprocess.run([sys.executable, "treinar_maestro.py"])

    background_tasks.add_task(run_training)

    return {
        "success": True,
        "message": "Treinamento iniciado em background",
    }


@app.get("/train/status")
async def training_status():
    """Status do treinamento"""
    metadata_file = FAISS_DIR / "metadata.json"

    if metadata_file.exists():
        with open(metadata_file) as f:
            metadata = json.load(f)
        return {
            "trained": True,
            "total_documents": metadata.get("total_documents", 0),
            "last_update": metadata.get("last_update"),
        }
    else:
        return {
            "trained": False,
            "message": "Execute POST /train para treinar o AI Maestro"
        }


# Run server

def main():
    """Inicia o servidor"""
    print("=" * 60)
    print("🎼 AI MAESTRO - API Service")
    print("=" * 60)
    print(f"\n🚀 Iniciando servidor em http://{API_HOST}:{API_PORT}")
    print(f"📁 Diretório de projetos: {PROJECTS_DIR.absolute()}")
    print(f"📚 Diretório FAISS: {FAISS_DIR.absolute()}")
    print(f"\n⚠ Execute 'python treinar_maestro.py' para treinar o AI Maestro")
    print("\nEndpoints disponíveis:")
    print("  GET  /                 - Status do serviço")
    print("  POST /compose          - Gerar composição MIDI")
    print("  POST /analyze          - Analisar áudio do YouTube")
    print("  POST /project/create   - Criar projeto Reaper/MuseScore")
    print("  POST /query            - Consultar AI Maestro (RAG)")
    print("  POST /arrange/suggest  - Sugerir arranjo")
    print("  POST /technique/explain - Explicar técnica")
    print("  GET  /download/:file   - Baixar arquivo gerado")
    print("  POST /train            - Treinar AI Maestro")
    print("=" * 60)

    uvicorn.run(app, host=API_HOST, port=API_PORT)


if __name__ == "__main__":
    main()
