#!/bin/bash
# setup_maestro.sh - Script de setup do AI Maestro

set -e

echo "================================================"
echo "🎼 AI MAESTRO - Setup"
echo "================================================"
echo ""

# Check Python version
echo "🐍 Verificando Python..."
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 não encontrado!"
    echo "   Instale com: sudo apt install python3 python3-pip"
    exit 1
fi

PYTHON_VERSION=$(python3 --version | cut -d' ' -f2 | cut -d'.' -f1,2)
echo "✅ Python $PYTHON_VERSION encontrado"

# Check virtualenv
echo ""
echo "📦 Verificando virtualenv..."
if ! command -v virtualenv &> /dev/null; then
    echo "⚠ virtualenv não encontrado, instalando..."
    pip3 install --user virtualenv
fi

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo ""
    echo "🔧 Criando ambiente virtual..."
    python3 -m venv venv
    echo "✅ Ambiente virtual criado"
fi

# Activate virtual environment
echo ""
echo "🔄 Ativando ambiente virtual..."
source venv/bin/activate

# Upgrade pip
echo ""
echo "⬆️ Atualizando pip..."
pip install --upgrade pip > /dev/null

# Install requirements
echo ""
echo "📥 Instalando dependências..."
pip install -r requirements.txt

# Check for API key
echo ""
echo "🔑 Verificando API keys..."
if [ -f ".env" ]; then
    echo "✅ Arquivo .env encontrado"
else
    echo "⚠ Criando .env a partir de .env.example..."
    cp .env.example .env
    echo "📝 Edite .env e adicione sua GOOGLE_API_KEY"
fi

# Create directories
echo ""
echo "📁 Criando diretórios..."
mkdir -p meus_livros
mkdir -p projetos
mkdir -p temp
mkdir -p cerebro_faiss
echo "✅ Diretórios criados"

# Check for PDFs
echo ""
PDF_COUNT=$(find meus_livros -name "*.pdf" 2>/dev/null | wc -l)
if [ $PDF_COUNT -eq 0 ]; then
    echo "⚠ Nenhum PDF encontrado em meus_livros/"
    echo "   Adicione seus PDFs de teoria, manuais, etc."
else
    echo "✅ $PDF_COUNT PDF(s) encontrado(s) em meus_livros/"
fi

# Done
echo ""
echo "================================================"
echo "✅ SETUP CONCLUÍDO!"
echo "================================================"
echo ""
echo "Próximos passos:"
echo ""
echo "1. Edite .env e adicione sua GOOGLE_API_KEY:"
echo "   nano .env"
echo ""
echo "2. Coloque seus PDFs em meus_livros/:"
echo "   cp /caminho/seus/pdfs/*.pdf meus_livros/"
echo ""
echo "3. Treine o AI Maestro:"
echo "   source venv/bin/activate"
echo "   python treinar_maestro.py"
echo ""
echo "4. Inicie o serviço:"
echo "   source venv/bin/activate"
echo "   python ai_maestro_service.py"
echo ""
echo "Ou use a CLI:"
echo "   source venv/bin/activate"
echo "   python estudio_master.py"
echo ""
