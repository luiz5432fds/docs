#!/usr/bin/env python3
"""
notebooklm_integration.py - Integração com NotebookLM Google

Conecta com NotebookLM para análise de documentos e geração de insights.
"""

import os
import json
from pathlib import Path
from typing import List, Dict, Any, Optional
from dataclasses import dataclass
import requests

# Google API imports
from google.auth import default
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload, MediaIoBaseDownload

# Configuration
TOKEN_FILE = Path("token.json")
CREDENTIALS_FILE = Path("credentials.json")


@dataclass
class NotebookSource:
    """Fonte de notebook para NotebookLM"""
    name: str
    content: str
    type: str = "text"  # text, pdf, audio


class NotebookLMClient:
    """
    Cliente para integração com NotebookLM

    Nota: NotebookLM API pode não estar publicamente disponível.
    Esta classe implementa os métodos conforme a documentação disponível.
    """

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.environ.get("NOTEBOOKLM_API_KEY")
        self.base_url = "https://notebooklm.googleapis.com/v1"
        self.credentials = None

        if not self.api_key:
            # Try OAuth authentication
            self._authenticate()

    def _authenticate(self):
        """Autentica usando OAuth 2.0"""
        try:
            # Check for existing token
            if TOKEN_FILE.exists():
                self.credentials = Credentials.from_authorized_user_file(
                    str(TOKEN_FILE),
                    scopes=["https://www.googleapis.com/auth/notebooklm"]
                )

            # Refresh or get new credentials
            if not self.credentials or not self.valid:
                from google_auth_oauthlib.flow import InstalledAppFlow

                flow = InstalledAppFlow.from_client_secrets_file(
                    str(CREDENTIALS_FILE),
                    scopes=["https://www.googleapis.com/auth/notebooklm"]
                )
                self.credentials = flow.run_local_server(port=0)

                # Save credentials
                with open(TOKEN_FILE, 'w') as token:
                    token.write(self.credentials.to_json())

        except Exception as e:
            print(f"⚠ Não foi possível autenticar com NotebookLM: {e}")

    @property
    def valid(self) -> bool:
        """Verifica se as credenciais são válidas"""
        if self.credentials:
            return self.credentials.valid
        return False

    def create_notebook(self, title: str, description: str = "") -> Dict[str, Any]:
        """Cria um novo notebook"""
        if self.api_key:
            # API key authentication
            headers = {"Authorization": f"Bearer {self.api_key}"}
            data = {
                "title": title,
                "description": description
            }
            response = requests.post(
                f"{self.base_url}/notebooks",
                json=data,
                headers=headers
            )
            return response.json() if response.ok else {}
        else:
            # OAuth authentication
            if not self.credentials:
                return {}

            service = build("notebooklm", "v1", credentials=self.credentials)
            request = {
                "title": title,
                "description": description
            }
            try:
                return service.notebooks().create(body=request).execute()
            except Exception as e:
                print(f"⚠ Erro ao criar notebook: {e}")
                return {}

    def add_source(self, notebook_id: str, source: NotebookSource) -> bool:
        """Adiciona uma fonte ao notebook"""
        if self.api_key:
            headers = {"Authorization": f"Bearer {self.api_key}"}
            data = {
                "name": source.name,
                "content": source.content,
                "type": source.type
            }
            response = requests.post(
                f"{self.base_url}/notebooks/{notebook_id}/sources",
                json=data,
                headers=headers
            )
            return response.ok
        else:
            if not self.credentials:
                return False

            service = build("notebooklm", "v1", credentials=self.credentials)
            request = {
                "name": source.name,
                "content": source.content,
                "type": source.type
            }
            try:
                service.notebooks().sources().create(
                    parent=notebook_id,
                    body=request
                ).execute()
                return True
            except Exception as e:
                print(f"⚠ Erro ao adicionar fonte: {e}")
                return False

    def query(self, notebook_id: str, question: str) -> str:
        """Faz uma pergunta ao notebook"""
        if self.api_key:
            headers = {"Authorization": f"Bearer {self.api_key}"}
            data = {"question": question}
            response = requests.post(
                f"{self.base_url}/notebooks/{notebook_id}:query",
                json=data,
                headers=headers
            )
            if response.ok:
                result = response.json()
                return result.get("answer", "")
            return ""
        else:
            if not self.credentials:
                return ""

            service = build("notebooklm", "v1", credentials=self.credentials)
            try:
                result = service.notebooks().query(
                    name=notebook_id,
                    body={"question": question}
                ).execute()
                return result.get("answer", "")
            except Exception as e:
                print(f"⚠ Erro ao consultar: {e}")
                return ""

    def analyze_music_context(self, notebook_id: str, audio_path: Path) -> Dict[str, Any]:
        """Analisa áudio musical no contexto do notebook"""
        # This would upload and analyze audio in NotebookLM
        # Implementation depends on actual API capabilities

        result = {
            "tempo": None,
            "key": None,
            "mood": None,
            "genre_suggestions": [],
            "instrumentation": [],
        }

        return result

    def generate_insights(self, notebook_id: str, topic: str) -> List[str]:
        """Gera insights sobre um tópico"""
        question = f"Generate detailed insights about {topic} for music composition and production"
        answer = self.query(notebook_id, question)

        # Parse insights (simplified)
        insights = [line.strip() for line in answer.split("\n") if line.strip()]
        return insights[:5]  # Return top 5 insights


class MusicKnowledgeBase:
    """
    Base de conhecimento musical usando NotebookLM

    Armazena e consulta informações sobre:
    - Teoria musical
    - Gêneros brasileiros
    - Orquestração
    - Produção
    """

    def __init__(self):
        self.client = NotebookLMClient()
        self.notebook_id = None

    def initialize(self, notebook_name: str = "AI Maestro Knowledge") -> bool:
        """Inicializa a base de conhecimento"""
        notebook = self.client.create_notebook(
            title=notebook_name,
            description="Base de conhecimento do AI Maestro sobre música brasileira, clássica e produção"
        )

        if notebook and "name" in notebook:
            self.notebook_id = notebook["name"]
            return True

        return False

    def add_music_theory(self, content: str) -> bool:
        """Adiciona conteúdo de teoria musical"""
        source = NotebookSource(
            name="Music Theory",
            content=content,
            type="text"
        )
        return self.client.add_source(self.notebook_id, source)

    def add_genre_info(self, genre: str, content: str) -> bool:
        """Adiciona informações sobre um gênero"""
        source = NotebookSource(
            name=f"{genre} Genre",
            content=content,
            type="text"
        )
        return self.client.add_source(self.notebook_id, source)

    def query_harmony(self, question: str) -> str:
        """Consulta sobre harmonia"""
        enhanced_q = f"About music harmony: {question}"
        return self.client.query(self.notebook_id, enhanced_q)

    def query_orchestration(self, question: str) -> str:
        """Consulta sobre orquestração"""
        enhanced_q = f"About orchestration and instrumentation: {question}"
        return self.client.query(self.notebook_id, enhanced_q)

    def query_genre(self, genre: str, question: str) -> str:
        """Consulta sobre um gênero específico"""
        enhanced_q = f"About {genre} music genre: {question}"
        return self.client.query(self.notebook_id, enhanced_q)

    def get_composition_suggestions(
        self,
        genre: str,
        mood: str,
        instruments: List[str]
    ) -> Dict[str, Any]:
        """Obtém sugestões de composição"""
        question = f"""
        Provide composition suggestions for a {genre} piece with {mood} mood,
        using these instruments: {', '.join(instruments)}.
        Include: harmony suggestions, rhythmic patterns, form/structure, and articulations.
        """

        answer = self.client.query(self.notebook_id, question)

        return {
            "genre": genre,
            "mood": mood,
            "instruments": instruments,
            "suggestions": answer
        }


# Utility functions for preparing content

def prepare_pdf_for_notebooklm(pdf_path: Path) -> NotebookSource:
    """Prepara um PDF para adicionar ao NotebookLM"""
    import pypdf

    reader = pypdf.PdfReader(pdf_path)
    text_content = []

    for page in reader.pages:
        text_content.append(page.extract_text())

    return NotebookSource(
        name=pdf_path.stem,
        content="\n\n".join(text_content),
        type="pdf"
    )


def prepare_audio_transcript(audio_path: Path, transcript: str) -> NotebookSource:
    """Prepara transcrição de áudio para NotebookLM"""
    return NotebookSource(
        name=f"{audio_path.stem}_transcript",
        content=transcript,
        type="audio_transcript"
    )


# CLI for testing
def main():
    """CLI para testar integração NotebookLM"""
    print("📓 NotebookLM Integration - AI Maestro")
    print("=" * 50)

    kb = MusicKnowledgeBase()

    if kb.initialize():
        print(f"✅ Notebook inicializado: {kb.notebook_id}")

        # Add sample knowledge
        kb.add_genre_info("Frevo", """
        Frevo é um gênero musical pernambucano caracterizado por:
        - Andamento rápido (130-140 BPM)
        - Instrumentação de metais (saxofones, trompetes, trombones, tuba)
        - Percussão (surdo, bumbo, pratos, agogô, ganzá)
        - Compasso 2/4 march-like
        - Melodias sincopadas e virtuosísticas
        """)

        print("\n📚 Conhecimento adicionado")

        # Query
        response = kb.query_genre("Frevo", "Qual a instrumentação típica?")
        print(f"\n❓ Pergunta: Qual a instrumentação típica de Frevo?")
        print(f"🎓 Resposta: {response}")

    else:
        print("❌ Não foi possível inicializar o notebook")
        print("   Verifique suas credenciais do Google Cloud")


if __name__ == "__main__":
    main()
