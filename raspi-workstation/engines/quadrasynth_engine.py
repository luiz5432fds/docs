"""Stub engine inspired by the Alesis QuadraSynth."""

from .base import BaseEngine


class QuadraSynthEngine(BaseEngine):
    def note_on(self, note: int, velocity: float) -> None:
        print(f"[QuadraSynth] Note on {note} vel={velocity}")

    def note_off(self, note: int) -> None:
        print(f"[QuadraSynth] Note off {note}")
