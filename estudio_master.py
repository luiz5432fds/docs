#!/usr/bin/env python3
"""
estudio_master.py - O AI Maestro: Compositor, Arranjador e Produtor

Agente IA especializado em:
- Música Brasileira (Frevo, Maracatu, Brega, Piseiro, Axé, Calypso, Cumbia, Samba, Choro, Bossa Nova)
- Música Clássica de todos os períodos
- Integração com Reaper e MuseScore 4
- Produção musical e orquestração
"""

import os
import sys
import json
import asyncio
from pathlib import Path
from typing import List, Dict, Any, Optional, Union
from datetime import datetime
from dataclasses import dataclass, field
import re

# LangChain for RAG
from langchain_community.vectorstores import FAISS
from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain.chains import RetrievalQA
from langchain.memory import ConversationBufferMemory
from langchain.prompts import PromptTemplate
from langchain.schema import BaseRetriever

# Audio processing
import librosa
import numpy as np
import soundfile as sf

# YouTube download
import yt_dlp

# Configuration
FAISS_DIR = Path("cerebro_faiss")
METADATA_FILE = FAISS_DIR / "metadata.json"
PROJECTS_DIR = Path("projetos")
TEMP_DIR = Path("temp")

# Initialize directories
for dir_path in [PROJECTS_DIR, TEMP_DIR]:
    dir_path.mkdir(exist_ok=True)


@dataclass
class ProjectInfo:
    """Informações do projeto musical"""
    name: str
    tempo: Optional[int] = None
    time_signature: str = "4/4"
    key: str = "C"
    style: str = ""
    tracks: List[Dict] = field(default_factory=list)
    created_at: str = field(default_factory=lambda: datetime.now().isoformat())


@dataclass
class AudioAnalysis:
    """Resultado da análise de áudio"""
    bpm: float
    key: str
    duration: float
    spectral_centroid: float
    zero_crossing_rate: float
    onset_times: np.ndarray
    tempo_confidence: float


class YouTubeDownloader:
    """Baixa áudio do YouTube"""

    def __init__(self, output_dir: Path = TEMP_DIR):
        self.output_dir = output_dir
        self.output_dir.mkdir(exist_ok=True)

    def download(self, url: str, quality: str = "best") -> Optional[Path]:
        """
        Baixa áudio do YouTube

        Args:
            url: URL do YouTube
            quality: Qualidade do áudio (best, worst, or specific)

        Returns:
            Caminho do arquivo baixado ou None
        """
        print(f"📥 Baixando: {url}")

        ydl_opts = {
            'format': 'bestaudio/best',
            'postprocessors': [{
                'key': 'FFmpegExtractAudio',
                'preferredcodec': 'wav',
                'preferredquality': '192',
            }],
            'outtmpl': str(self.output_dir / '%(title)s.%(ext)s'),
            'quiet': False,
            'no_warnings': False,
        }

        try:
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(url, download=True)
                filename = ydl.prepare_filename(info).replace('.webm', '.wav').replace('.m4a', '.wav')

                print(f"✅ Baixado: {Path(filename).name}")
                return Path(filename)

        except Exception as e:
            print(f"❌ Erro ao baixar: {e}")
            return None


class AudioAnalyzer:
    """Analisa áudio: BPM, key, etc."""

    def __init__(self):
        self.sample_rate = 22050

    def analyze(self, audio_path: Path) -> AudioAnalysis:
        """
        Analisa arquivo de áudio

        Retorna: BPM, key, duração, etc.
        """
        print(f"🔊 Analisando: {audio_path.name}")

        # Load audio
        y, sr = librosa.load(audio_path, sr=self.sample_rate)

        # Detect BPM
        tempo, beats = librosa.beat.beat_track(y=y, sr=sr)

        # Detect onset times
        onset_frames = librosa.onset.onset_detect(y=y, sr=sr)
        onset_times = librosa.frames_to_time(onset_frames, sr=sr)

        # Spectral features
        spectral_centroid = librosa.feature.spectral_centroid(y=y, sr=sr)[0].mean()
        zcr = librosa.feature.zero_crossing_rate(y)[0].mean()

        # Estimate key (simplified)
        chroma = librosa.feature.chroma_stft(y=y, sr=sr)
        key_estimate = self._estimate_key(chroma)

        # Duration
        duration = librosa.get_duration(y=y, sr=sr)

        print(f"   BPM: {tempo:.1f}")
        print(f"   Key estimada: {key_estimate}")
        print(f"   Duração: {duration:.1f}s")

        return AudioAnalysis(
            bpm=float(tempo),
            key=key_estimate,
            duration=duration,
            spectral_centroid=float(spectral_centroid),
            zero_crossing_rate=float(zcr),
            onset_times=onset_times,
            tempo_confidence=0.85  # Librosa doesn't provide confidence directly
        )

    def _estimate_key(self, chroma: np.ndarray) -> str:
        """Estima a tonalidade baseado no chromagram"""
        # Average chroma across time
        chroma_mean = chroma.mean(axis=1)

        # Map to key profiles (simplified Krumhansl-Schmuckler)
        major_profile = np.array([6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88])
        minor_profile = np.array([6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.38, 3.18, 2.23, 4.84])

        # Normalize
        major_profile /= major_profile.sum()
        minor_profile /= minor_profile.sum()

        # Correlate
        major_corr = []
        minor_corr = []
        keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

        for i in range(12):
            rotated = np.roll(chroma_mean, -i)
            major_corr.append(np.corrcoef(rotated, major_profile)[0, 1])
            minor_corr.append(np.corrcoef(rotated, minor_profile)[0, 1])

        major_max = max(major_corr)
        minor_max = max(minor_corr)

        if major_max > minor_max:
            return f"{keys[major_corr.index(major_max)]} major"
        else:
            return f"{keys[minor_corr.index(minor_max)]} minor"


class ReaperProjectGenerator:
    """Gera arquivos de projeto Reaper (.rpp) e scripts ReaScript"""

    INSTRUMENT_TEMPLATES = {
        # Brasileiros
        "pandeiro": {"name": "Pandeiro", "midi_channel": 0, "plugin": "VSTi: Pandeiro Sample"},
        "zabumba": {"name": "Zabumba", "midi_channel": 1, "plugin": "VSTi: Zabumba"},
        "alfaia": {"name": "Alfaia", "midi_channel": 2, "plugin": "VSTi: Alfaia"},
        "agogo": {"name": "Agogô", "midi_channel": 3, "plugin": "VSTi: Agogo"},
        "cuica": {"name": "Cuíca", "midi_channel": 4, "plugin": "VSTi: Cuica"},
        "surdo": {"name": "Surdo", "midi_channel": 5, "plugin": "VSTi: Surdo"},
        "reco-reco": {"name": "Reco-reco", "midi_channel": 6, "plugin": "VSTi: Reco-reco"},
        "cavaquinho": {"name": "Cavaquinho", "midi_channel": 7, "plugin": "VSTi: Cavaquinho"},
        "bandolim": {"name": "Bandolim", "midi_channel": 8, "plugin": "VSTi: Mandolin"},
        "violao_7cordas": {"name": "Violão 7 Cordas", "midi_channel": 9, "plugin": "VSTi: Nylon Guitar"},
        "piano": {"name": "Piano", "midi_channel": 0, "plugin": "VSTi: The Grand"},
        "violino": {"name": "Violino", "midi_channel": 10, "plugin": "VSTi: Violin Section"},
        "flauta": {"name": "Flauta", "midi_channel": 11, "plugin": "VSTi: Flute"},
        # Clássicos
        "trompete": {"name": "Trompete", "midi_channel": 12, "plugin": "VSTi: Trumpet"},
        "trombone": {"name": "Trombone", "midi_channel": 13, "plugin": "VSTi: Trombone"},
        "clarinete": {"name": "Clarinete", "midi_channel": 14, "plugin": "VSTi: Clarinet"},
        "fagote": {"name": "Fagote", "midi_channel": 15, "plugin": "VSTi: Bassoon"},
    }

    GENRE_CONFIGURATIONS = {
        "frevo": {
            "tempo": 130,
            "instruments": ["pandeiro", "surdo", "agogo", "trompete", "saxofone", "trombone", "tuba"],
            "pattern": "2/4 march-like",
            "characteristics": "Fast, brass-heavy, syncopated"
        },
        "maracatu": {
            "tempo": 120,
            "instruments": ["alfaia", "zabumba", "agogo", "cuica", "gonguê"],
            "pattern": "4/4 slow groove",
            "characteristics": "Heavy drums, call-and-response"
        },
        "samba": {
            "tempo": 110,
            "instruments": ["pandeiro", "surdo", "tamborim", "agogo", "cavaquinho", "violao_7cordas"],
            "pattern": "2/4 samba groove",
            "characteristics": "Syncopated, percussion-driven"
        },
        "choro": {
            "tempo": 90,
            "instruments": ["pandeiro", "cavaquinho", "bandolim", "flauta", "violao_7cordas"],
            "pattern": "2/4 binary",
            "characteristics": "Fast, virtuosic, contrapuntal"
        },
        "bossa_nova": {
            "tempo": 120,
            "instruments": ["piano", "violao", "baixo", "bateria", "violino", "flauta"],
            "pattern": "4/4 bossa beat",
            "characteristics": "Soft, syncopated guitar, jazz-influenced"
        },
        "brega": {
            "tempo": 95,
            "instruments": ["piano", "sintetizador", "bateria", "baixo", "trompete", "saxofone"],
            "pattern": "4/4 ballad or upbeat",
            "characteristics": "Romantic, electronic elements"
        },
        "piseiro": {
            "tempo": 140,
            "instruments": ["zabumba", "triangulo", "sanfona", "agogo", "pandeiro"],
            "pattern": "4/4 fast beat",
            "characteristics": "Very fast, repetitive, dance-oriented"
        },
        "axe": {
            "tempo": 100,
            "instruments": ["bateria", "percussao", "sintetizador", "baixo", "metais"],
            "pattern": "4/4 afro-beat",
            "characteristics": "African rhythms, electronic, carnival"
        },
        "calypso": {
            "tempo": 110,
            "instruments": ["bateria", "percussao", "sintetizador", "baixo", "metais"],
            "pattern": "4/4 Caribbean",
            "characteristics": "Caribbean influence, melodic"
        },
        "cumbia": {
            "tempo": 95,
            "instruments": ["bateria", "güiro", "flauta", "acordeão", "baixo"],
            "pattern": "2/4 or 4/4",
            "characteristics": "Latin American, syncopated"
        },
    }

    def __init__(self, project_name: str, output_dir: Path = PROJECTS_DIR):
        self.project_name = project_name
        self.output_dir = output_dir / project_name
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self.project_path = self.output_dir / f"{project_name}.rpp"

    def generate_rpp(self, project_info: ProjectInfo) -> Path:
        """Gera arquivo de projeto Reaper .rpp"""

        rpp_content = f"""<REAPER_PROJECT 0.1 "6.78/x64" {datetime.now().strftime("%Y-%m-%d %H:%M:%M")}
'''

# Generated by AI Maestro
# Project: {project_info.name}
# Tempo: {project_info.tempo or 120}
# Key: {project_info.key}
# Style: {project_info.style}

'''

"""
        # Add tracks
        for i, track in enumerate(project_info.tracks):
            rpp_content += f"""
<TRACK {{A7E5F3C4-4C5A-4B3D-8E2F-1A4B6C8D9E0F}}
  NAME {track.get('name', f'Track {i+1}')}
  PEAK 1 1.0
  VOLSET 1.0 0.0 1.0
  SOLO 0
  MUTE 0
  REC 0
  FXID 1
  <INSTRUMENT {{
    <FXCHAIN {{
      FXID {{
        {{A7E5F3C4-4C5A-4B3D-8E2F-1A4B6C8D9E0F}}
        VST {{VSTi: {track.get('instrument', 'Piano')}}}
        0.0 1.0 0 0
      }}
    }}
  }}
  MIDIOUT {{
    -1
  }}
  <ITEM {{
    POSITION 0.0
    LENGTH 240.0
    POSITIONINPROJECT 0.0
    SLOPES 1.0 0.0
    <SOURCE MIDI
      HASDATA 1
      EE 0
    >
  }}
"""

        # Add project settings
        rpp_content += f"""
<PROJECT
  TEMPO {project_info.tempo or 120} 4 4
  TIME_SIGNATURE {project_info.time_signature.split('/')[0]} {project_info.time_signature.split('/')[1]} 4
  "

"""
        with open(self.project_path, 'w') as f:
            f.write(rpp_content)

        print(f"📁 Projeto Reaper criado: {self.project_path}")
        return self.project_path

    def generate_reascript(self, action: str, params: Dict) -> str:
        """Gera script ReaScript (Lua) para automatizar tarefas"""

        scripts = {
            "set_tempo": f"""
-- AI Maestro: Set Tempo
local tempo = {params.get('tempo', 120)}
reaper.SetCurrentBPM(0, tempo, false)
reaper.UpdateTimeline()
reaper.ShowMessageBox("Tempo set to " .. tempo .. " BPM", "AI Maestro", 0)
""",
            "create_track": f"""
-- AI Maestro: Create Track
local track_name = "{params.get('name', 'New Track')}"
local track = reaper.AddTrackForRecv(-2)
reaper.GetSetMediaTrackInfo_String(track, "P_NAME", track_name, true)
reaper.ShowMessageBox("Created track: " .. track_name, "AI Maestro", 0)
""",
            "setup_instruments": f"""
-- AI Maestro: Setup Instruments for {params.get('genre', 'samba')}

local instruments = {json.dumps(params.get('instruments', []))}

for i, inst in ipairs(instruments) do
    local track = reaper.AddTrackForRecv(-2)
    reaper.GetSetMediaTrackInfo_String(track, "P_NAME", inst, true)

    -- Add instrument plugin (placeholder)
    -- reaper.TrackFX_AddByName(track, inst, false, -1)
end

reaper.ShowMessageBox("Created " .. #instruments .. " instrument tracks", "AI Maestro", 0)
""",
        }

        script_path = self.output_dir / f"{action}_script.lua"
        if action in scripts:
            with open(script_path, 'w') as f:
                f.write(scripts[action])
            print(f"📜 Script ReaScript criado: {script_path}")
            return str(script_path)

        return ""

    def setup_for_genre(self, genre: str) -> Dict[str, Any]:
        """Configura projeto para um gênero brasileiro específico"""

        genre_lower = genre.lower().replace(" ", "_")
        config = self.GENRE_CONFIGURATIONS.get(genre_lower, self.GENRE_CONFIGURATIONS["samba"])

        project_info = ProjectInfo(
            name=f"AI Maestro - {genre.title()} Project",
            tempo=config["tempo"],
            time_signature="4/4" if "4/4" in config["pattern"] else "2/4",
            key="C",
            style=genre,
        )

        # Create tracks from genre configuration
        for inst in config["instruments"]:
            template = self.INSTRUMENT_TEMPLATES.get(inst, self.INSTRUMENT_TEMPLATES["piano"])
            project_info.tracks.append({
                "name": template["name"],
                "instrument": inst,
                "midi_channel": template["midi_channel"],
                "plugin": template["plugin"],
            })

        # Generate RPP file
        rpp_path = self.generate_rpp(project_info)

        # Generate setup script
        script_path = self.generate_reascript("setup_instruments", {
            "genre": genre,
            "instruments": [t["name"] for t in project_info.tracks]
        })

        return {
            "project_file": str(rpp_path),
            "setup_script": script_path,
            "tempo": config["tempo"],
            "instruments": config["instruments"],
            "characteristics": config["characteristics"]
        }


class MuseScoreExporter:
    """Gera arquivos MusicXML para MuseScore"""

    def __init__(self, project_name: str, output_dir: Path = PROJECTS_DIR):
        self.project_name = project_name
        self.output_dir = output_dir / project_name
        self.output_dir.mkdir(parents=True, exist_ok=True)

    def generate_musicxml(self, project_info: ProjectInfo) -> Path:
        """Gera arquivo MusicXML básico"""

        output_path = self.output_dir / f"{project_name}.musicxml"

        xml_content = f'''<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 3.1 Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd">
<score-partwise version="3.1">
  <work>
    <work-title>{project_info.name}</work-title>
  </work>
  <identification>
    <creator type="composer">AI Maestro</creator>
    <encoding>
      <software>AI Maestro</software>
      <encoding-date>{datetime.now().strftime("%Y-%m-%d")}</encoding-date>
    </encoding>
  </identification>
  <part-list>
'''

        # Add parts for each track
        for i, track in enumerate(project_info.tracks):
            xml_content += f'''
    <score-part id="P{i+1}">
      <part-name>{track.get('name', 'Track')}</part-name>
      <score-instrument id="I{i+1}">
        <instrument-name>{track.get('instrument', 'Piano')}</instrument-name>
      </score-instrument>
    </score-part>
'''

        xml_content += "  </part-list>\n"

        # Add measures
        for i, track in enumerate(project_info.tracks):
            xml_content += f'''
  <part id="P{i+1}">
    <measure number="1">
      <attributes>
        <divisions>4</divisions>
        <key>
          <fifths>0</fifths>
        </key>
        <time>
          <beats>4</beats>
          <beat-type>4</beat-type>
        </time>
        <clef>
          <sign>G</sign>
          <line>2</line>
        </clef>
      </attributes>
      <note>
        <pitch>
          <step>C</step>
          <octave>4</octave>
        </pitch>
        <duration>4</duration>
        <type>whole</type>
      </note>
    </measure>
  </part>
'''

        xml_content += "</score-partwise>"

        with open(output_path, 'w') as f:
            f.write(xml_content)

        print(f"📄 MusicXML criado: {output_path}")
        return output_path


class AIMaestro:
    """
    O AI Maestro: Agente principal com RAG

    Especializado em:
    - Música Brasileira (todos os gêneros)
    - Música Clássica (todos os períodos)
    - Integração Reaper/MuseScore
    """

    BRAZILIAN_GENRES = [
        "Frevo", "Maracatu", "Brega", "Piseiro", "Axé", "Calypso",
        "Cumbia", "Samba", "Choro", "Bossa Nova", "Forró", "Afoxé",
        "Baião", "Xaxado", "Xote", "Marcha Rancho", "Samba-Enredo"
    ]

    CLASSICAL_PERIODS = [
        "Medieval", "Renaissance", "Baroque", "Classical", "Romantic",
        "Modern", "Contemporary", "20th Century", "21st Century"
    ]

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.environ.get("GOOGLE_API_KEY")
        self.embeddings = self._init_embeddings()
        self.vector_store = self._load_vector_store()
        self.qa_chain = self._init_qa_chain()
        self.memory = ConversationBufferMemory()

        # Components
        self.youtube = YouTubeDownloader()
        self.audio_analyzer = AudioAnalyzer()
        self.reaper = ReaperProjectGenerator("temp")
        self.musescore = MuseScoreExporter("temp")

    def _init_embeddings(self):
        """Inicializa embeddings"""
        if self.api_key:
            return GoogleGenerativeAIEmbeddings(
                model="models/embedding-001",
                google_api_key=self.api_key
            )
        else:
            return HuggingFaceEmbeddings(
                model_name="sentence-transformers/all-MiniLM-L6-v2"
            )

    def _load_vector_store(self) -> Optional[FAISS]:
        """Carrega o índice FAISS treinado"""
        if FAISS_DIR.exists():
            try:
                return FAISS.load_local(str(FAISS_DIR), self.embeddings, allow_dangerous_deserialization=True)
            except Exception as e:
                print(f"⚠ Não foi possível carregar FAISS: {e}")
        return None

    def _init_qa_chain(self):
        """Inicializa a cadeia de QA com RAG"""
        if not self.vector_store:
            print("⚠ Vector store não disponível, usando modelo sem RAG")
            return None

        prompt_template = """Você é o AI Maestro, um especialista em música brasileira e clássica,
orquestração, produção musical, e integração com Reaper e MuseScore.

Responda à pergunta usando o contexto fornecido. Se não souber a resposta com o contexto,
diga honestamente que não tem essa informação específica, mas ofereça ajuda geral.

Contexto relevante:
{context}

Pergunta: {question}

Resposta do AI Maestro:"""

        PROMPT = PromptTemplate(
            template=prompt_template,
            input_variables=["context", "question"]
        )

        if self.api_key:
            llm = ChatGoogleGenerativeAI(
                model="gemini-pro",
                google_api_key=self.api_key,
                temperature=0.7
            )
        else:
            # Fallback to local model
            from langchain_community.llms import HuggingFacePipeline
            llm = HuggingFacePipeline.from_model_id(
                model_id="google/flan-t5-large",
                task="text2text-generation",
            )

        retriever = self.vector_store.as_retriever(
            search_kwargs={"k": 4}
        )

        return RetrievalQA.from_chain_type(
            llm=llm,
            chain_type="stuff",
            retriever=retriever,
            return_source_documents=True,
            chain_type_kwargs={"prompt": PROMPT}
        )

    def ask(self, question: str) -> str:
        """Faz uma pergunta ao AI Maestro"""
        if self.qa_chain:
            result = self.qa_chain({"query": question})
            source_info = "\n\n📚 Fontes:\n" + "\n".join([
                f"  - {doc.metadata.get('filename', 'Unknown')}"
                for doc in result.get("source_documents", [])
            ])
            return result["result"] + source_info
        else:
            return f"⚠ AI Maestro não está treinado. Execute 'python treinar_maestro.py' primeiro."

    # Specialized query methods

    def ask_about_genre(self, genre: str, question: str) -> str:
        """Pergunta específica sobre um gênero"""
        enhanced_q = f"Sobre {genre}: {question}"
        return self.ask(enhanced_q)

    def ask_instrumentation(self, genre: str, instrumentation: str = "") -> str:
        """Pergunta sobre instrumentação para um gênero"""
        question = f"Qual a instrumentação típica para {genre}"
        if instrumentation:
            question += f" incluindo {instrumentation}"
        return self.ask(question)

    def ask_orchestration(self, period: str, forces: str = "") -> str:
        """Pergunta sobre orquestração de um período"""
        question = f"Como orquestrar para música {period}"
        if forces:
            question += f" com {forces}"
        return self.ask(question)

    # Workflow methods

    def download_and_analyze(self, youtube_url: str) -> Optional[AudioAnalysis]:
        """Baixa e analisa áudio do YouTube"""
        audio_path = self.youtube.download(youtube_url)
        if audio_path:
            return self.audio_analyzer.analyze(audio_path)
        return None

    def create_project_from_analysis(
        self,
        analysis: AudioAnalysis,
        genre: str,
        project_name: str
    ) -> Dict[str, Any]:
        """Cria projeto baseado na análise de áudio"""
        self.reaper = ReaperProjectGenerator(project_name)
        self.musescore = MuseScoreExporter(project_name)

        project_info = ProjectInfo(
            name=project_name,
            tempo=int(analysis.bpm),
            key=analysis.key,
            style=genre,
        )

        # Setup for genre
        genre_config = self.reaper.setup_for_genre(genre)

        # Generate MusicXML
        xml_path = self.musescore.generate_musicxml(project_info)

        return {
            **genre_config,
            "musicxml_file": str(xml_path),
            "analysis": {
                "bpm": analysis.bpm,
                "key": analysis.key,
                "duration": analysis.duration
            }
        }

    def get_reaper_setup(self, genre: str) -> Dict[str, Any]:
        """Retorna configuração para projeto Reaper"""
        self.reaper = ReaperProjectGenerator(f"{genre}_project")
        return self.reaper.setup_for_genre(genre)

    def suggest_arrangement(
        self,
        genre: str,
        mood: str = "",
        instruments: List[str] = None
    ) -> str:
        """Sugere arranjo baseado em parâmetros"""
        question = f"Sugira um arranjo de {genre}"
        if mood:
            question += f" com clima {mood}"
        if instruments:
            question += f" para {', '.join(instruments)}"

        return self.ask(question)

    def explain_technique(self, technique: str, context: str = "") -> str:
        """Explica uma técnica musical"""
        question = f"Explique a técnica de {technique}"
        if context:
            question += f" no contexto de {context}"
        return self.ask(question)


# CLI Interface
def main():
    """Interface CLI simples"""
    print("=" * 60)
    print("🎼 AI MAESTRO - Estúdio Master")
    print("=" * 60)

    maestro = AIMaestro()

    if not maestro.vector_store:
        print("\n⚠ Cérebro não treinado!")
        print("   Execute: python treinar_maestro.py")
        return

    print("\n✅ AI Maestro está pronto!")
    print("\nComandos disponíveis:")
    print("  ask <pergunta>    - Faça uma pergunta")
    print("  genre <gênero>     - Info sobre gênero brasileiro")
    print("  classical <período> - Info sobre período clássico")
    print("  setup <gênero>     - Configura projeto Reaper")
    print("  download <url>     - Baixa e analisa áudio")
    print("  quit               - Sair")

    while True:
        try:
            cmd = input("\n❯ ").strip()
            if not cmd:
                continue

            parts = cmd.split(maxsplit=1)
            action = parts[0].lower()

            if action == "quit":
                print("👋 Até logo!")
                break

            elif action == "ask" and len(parts) > 1:
                print(f"\n🎓 {maestro.ask(parts[1])}")

            elif action == "genre" and len(parts) > 1:
                genre = parts[1]
                response = maestro.ask_about_genre(
                    genre,
                    "características, instrumentação, andamento e história"
                )
                print(f"\n🎵 {response}")

            elif action == "setup" and len(parts) > 1:
                genre = parts[1]
                result = maestro.get_reaper_setup(genre)
                print(f"\n🎛️ Projeto criado:")
                print(f"   Arquivo: {result['project_file']}")
                print(f"   Script: {result['setup_script']}")
                print(f"   BPM: {result['tempo']}")
                print(f"   Instrumentos: {', '.join(result['instruments'])}")

            elif action == "download" and len(parts) > 1:
                analysis = maestro.download_and_analyze(parts[1])
                if analysis:
                    print(f"\n🎵 Análise completa:")
                    print(f"   BPM: {analysis.bpm}")
                    print(f"   Key: {analysis.key}")
                    print(f"   Duração: {analysis.duration:.1f}s")

            else:
                print(f"❌ Comando não reconhecido: {action}")

        except KeyboardInterrupt:
            print("\n👋 Até logo!")
            break
        except Exception as e:
            print(f"❌ Erro: {e}")


if __name__ == "__main__":
    main()
