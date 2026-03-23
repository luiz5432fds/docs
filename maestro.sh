#!/bin/bash
# maestro.sh - Launcher do AI Maestro

# Activate virtual environment
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

if [ -d "venv" ]; then
    source venv/bin/activate
else
    echo "❌ Ambiente virtual não encontrado!"
    echo "   Execute primeiro: ./setup_maestro.sh"
    exit 1
fi

# Check what to launch
case "${1:-service}" in
    cli)
        echo "🎼 Iniciando AI Maestro CLI..."
        python estudio_master.py
        ;;
    train)
        echo "📚 Treinando AI Maestro..."
        python treinar_maestro.py
        ;;
    service)
        echo "🚀 Iniciando API Service..."
        python ai_maestro_service.py
        ;;
    notebook)
        echo "📓 Testando integração NotebookLM..."
        python notebooklm_integration.py
        ;;
    compose)
        echo "🎹 Gerando MIDI..."
        python midi_composer.py
        ;;
    *)
        echo "AI Maestro - Launcher"
        echo ""
        echo "Uso: ./maestro.sh [comando]"
        echo ""
        echo "Comandos:"
        echo "  service - Inicia API REST (default)"
        echo "  cli     - Inicia interface CLI"
        echo "  train   - Treina o AI Maestro com PDFs"
        echo "  compose - Gera MIDI de teste"
        echo "  notebook - Testa NotebookLM"
        echo ""
        exit 1
        ;;
esac
