#!/usr/bin/env python3
"""
treinar_maestro.py - Treina o cérebro do AI Maestro com RAG

Processa a biblioteca de PDFs e cria o banco de dados vetorial FAISS
para que o AI Maestro possa "ler" e consultar todo o conhecimento técnico.
"""

import os
import sys
from pathlib import Path
from typing import List, Dict, Any
import json
import hashlib
from datetime import datetime

# LangChain imports
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import PyPDFLoader, TextLoader
from langchain_community.vectorstores import FAISS
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain.docstore.document import Document
from langchain_community.embeddings import HuggingFaceEmbeddings

# PDF processing
import pypdf
from pypdf import PdfReader

# Configuration
PDF_DIR = Path("meus_livros")
FAISS_DIR = Path("cerebro_faiss")
METADATA_FILE = FAISS_DIR / "metadata.json"
INDEX_FILE = FAISS_DIR / "index"

# Chunking configuration
CHUNK_SIZE = 1000
CHUNK_OVERLAP = 200

# Categories for organizing knowledge
CATEGORIES = {
    "sintetizadores": ["XPS-10", "synth", "synthesizer", "Roland", "Juno", "GAIA"],
    "reaper": ["Reaper", "ReaScript", "DAW", "rpp"],
    "teoria_musical": ["theory", "harmony", "counterpoint", "orchestration"],
    "musica_brasileira": ["Frevo", "Maracatu", "Brega", "Piseiro", "Axé", "Calypso", "Cumbia", "Samba", "Choro", "Bossa"],
    "musescore": ["MuseScore", "MusicXML", "notation"],
    "audio": ["audio", "acoustics", "mixing", "mastering", "production"],
    "orquestracao": ["orchestration", "instrumentation", "arranging"],
    "historia": ["history", "periods", "Baroque", "Classical", "Romantic", "Modern"],
}


def get_file_hash(filepath: Path) -> str:
    """Calcula hash do arquivo para detectar mudanças"""
    with open(filepath, "rb") as f:
        return hashlib.md5(f.read()).hexdigest()


def categorize_document(filename: str, content: str) -> List[str]:
    """Categoriza o documento baseado no nome e conteúdo"""
    categories = []
    text = (filename + " " + content).lower()

    for category, keywords in CATEGORIES.items():
        if any(keyword.lower() in text for keyword in keywords):
            categories.append(category)

    return categories if categories else ["geral"]


def extract_text_from_pdf(filepath: Path) -> tuple[str, Dict[str, Any]]:
    """Extrai texto e metadados de um PDF"""
    reader = PdfReader(filepath)
    text_content = []

    # Extract metadata
    metadata = {
        "title": reader.metadata.title if reader.metadata.title else filepath.stem,
        "author": reader.metadata.author if reader.metadata.author else "Unknown",
        "page_count": len(reader.pages),
        "filepath": str(filepath),
        "filename": filepath.name,
        "category": [],
    }

    # Extract text from each page
    for page_num, page in enumerate(reader.pages, 1):
        try:
            page_text = page.extract_text()
            if page_text.strip():
                text_content.append({
                    "page": page_num,
                    "text": page_text
                })
        except Exception as e:
            print(f"  ⚠ Erro ao ler página {page_num}: {e}")

    full_text = "\n\n".join([p["text"] for p in text_content])

    # Detect language and categorize
    metadata["category"] = categorize_document(filepath.name, full_text[:500])

    return full_text, metadata


def process_single_pdf(filepath: Path, embeddings) -> List[Document]:
    """Processa um único PDF e retorna documentos chunked"""
    print(f"\n📖 Processando: {filepath.name}")

    try:
        # Extract text
        text, metadata = extract_text_from_pdf(filepath)

        if not text or len(text.strip()) < 50:
            print(f"  ⚠ Texto muito curto ou vazio, pulando...")
            return []

        print(f"  ✅ {metadata['page_count']} páginas | {len(text)} caracteres")
        print(f"  📁 Categorias: {', '.join(metadata['category'])}")

        # Split into chunks
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=CHUNK_SIZE,
            chunk_overlap=CHUNK_OVERLAP,
            separators=["\n\n", "\n", ". ", " ", ""],
            length_function=len,
        )

        chunks = text_splitter.split_text(text)

        # Create documents with metadata
        documents = []
        for i, chunk in enumerate(chunks):
            doc = Document(
                page_content=chunk,
                page_content_type="text",
                metadata={
                    **metadata,
                    "chunk_id": i,
                    "total_chunks": len(chunks),
                    "processed_date": datetime.now().isoformat(),
                }
            )
            documents.append(doc)

        print(f"  🧩 Criou {len(documents)} chunks")
        return documents

    except Exception as e:
        print(f"  ❌ Erro ao processar {filepath.name}: {e}")
        return []


def load_existing_metadata() -> Dict[str, Any]:
    """Carrega metadados existentes do índice"""
    if METADATA_FILE.exists():
        with open(METADATA_FILE, "r") as f:
            return json.load(f)
    return {"files": {}, "last_update": None}


def save_metadata(metadata: Dict[str, Any]):
    """Salva metadados do índice"""
    METADATA_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(METADATA_FILE, "w") as f:
        json.dump(metadata, f, indent=2)


def initialize_embeddings():
    """Inicializa o modelo de embeddings"""
    api_key = os.environ.get("GOOGLE_API_KEY")

    if api_key:
        print("🔑 Usando Google Generative AI Embeddings")
        return GoogleGenerativeAIEmbeddings(
            model="models/embedding-001",
            google_api_key=api_key
        )
    else:
        print("🔑 Usando HuggingFace Embeddings (local)")
        return HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-MiniLM-L6-v2",
            model_kwargs={'device': 'cpu'},
            encode_kwargs={'normalize_embeddings': True}
        )


def main():
    """Função principal de treinamento"""
    print("=" * 60)
    print("🎼 AI MAESTRO - Treinamento do Cérebro RAG")
    print("=" * 60)

    # Verify PDF directory
    if not PDF_DIR.exists():
        print(f"\n📁 Criando diretório {PDF_DIR}/")
        PDF_DIR.mkdir(parents=True, exist_ok=True)
        print(f"   ⚠ Coloque seus PDFs em: {PDF_DIR.absolute()}/")
        print(f"   E execute este script novamente.")
        return

    # Find all PDFs
    pdf_files = list(PDF_DIR.glob("*.pdf")) + list(PDF_DIR.glob("**/*.pdf"))

    if not pdf_files:
        print(f"\n⚠ Nenhum PDF encontrado em {PDF_DIR}/")
        print(f"   Adicione seus PDFs e execute novamente.")
        return

    print(f"\n📚 Encontrados {len(pdf_files)} PDF(s) para processar")

    # Initialize embeddings
    embeddings = initialize_embeddings()

    # Load existing metadata
    metadata = load_existing_metadata()
    all_documents = []
    updated_files = []

    # Process each PDF
    for pdf_path in pdf_files:
        file_hash = get_file_hash(pdf_path)
        file_key = str(pdf_path.relative_to(PDF_DIR))

        # Skip if file unchanged
        if file_key in metadata["files"] and metadata["files"][file_key]["hash"] == file_hash:
            print(f"⏭  Pulando (sem mudanças): {pdf_path.name}")
            continue

        # Process the PDF
        documents = process_single_pdf(pdf_path, embeddings)
        if documents:
            all_documents.extend(documents)
            metadata["files"][file_key] = {
                "hash": file_hash,
                "page_count": documents[0].metadata.get("page_count", 0),
                "categories": documents[0].metadata.get("category", []),
                "processed_date": datetime.now().isoformat()
            }
            updated_files.append(pdf_path.name)

    if not all_documents:
        print("\n⏭ Nenhum arquivo novo para processar.")
        print(f"   Total de arquivos indexados: {len(metadata['files'])}")
        return

    print(f"\n📝 Total de chunks a indexar: {len(all_documents)}")

    # Create or update FAISS index
    if FAISS_DIR.exists() and INDEX_FILE.exists():
        print("🔄 Atualizando índice FAISS existente...")
        vector_store = FAISS.load_local(str(FAISS_DIR), embeddings, allow_dangerous_deserialization=True)
        vector_store.add_documents(all_documents)
    else:
        print("🆕 Criando novo índice FAISS...")
        FAISS_DIR.mkdir(parents=True, exist_ok=True)
        vector_store = FAISS.from_documents(all_documents, embeddings)

    # Save the index
    print("💾 Salvando índice...")
    vector_store.save_local(str(FAISS_DIR))

    # Update metadata
    metadata["last_update"] = datetime.now().isoformat()
    metadata["total_documents"] = len(metadata["files"])
    save_metadata(metadata)

    # Print summary
    print("\n" + "=" * 60)
    print("✅ TREINAMENTO CONCLUÍDO!")
    print("=" * 60)
    print(f"📊 Arquivos processados: {len(updated_files)}")
    print(f"📚 Total de arquivos indexados: {len(metadata['files'])}")
    print(f"🧩 Total de chunks: {len(all_documents)}")
    print(f"📁 Índice salvo em: {FAISS_DIR.absolute()}/")
    print("=" * 60)

    # Print statistics by category
    category_counts = {}
    for file_data in metadata["files"].values():
        for cat in file_data.get("categories", ["geral"]):
            category_counts[cat] = category_counts.get(cat, 0) + 1

    if category_counts:
        print("\n📈 Distribuição por categoria:")
        for cat, count in sorted(category_counts.items()):
            print(f"   {cat}: {count} arquivo(s)")


if __name__ == "__main__":
    main()
