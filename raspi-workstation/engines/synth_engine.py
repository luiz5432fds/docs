"""Exemplo de motor sonoro para síntese sonora."""

from typing import Any


class SynthEngine:
    """Motor de síntese simplificado."""

    def __init__(self) -> None:
        self.parameters = {
            "oscillator": "sine",
            "filter": {
                "cutoff": 1000,
                "resonance": 0.5,
            },
        }

    def note_on(self, note: int, velocity: float) -> Any:
        """Inicia a reprodução de uma nota (simulado)."""
        # TODO: implementar síntese real
        print(f"Nota ligada: {note} vel={velocity}")

    def note_off(self, note: int) -> Any:
        """Encerra a nota (simulado)."""
        print(f"Nota desligada: {note}")
