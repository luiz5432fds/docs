"""Stub engine for analog synth sounds."""

from .base import BaseEngine


class AnalogEngine(BaseEngine):
    def note_on(self, note: int, velocity: float) -> None:
        print(f"[Analog] Note on {note} vel={velocity}")

    def note_off(self, note: int) -> None:
        print(f"[Analog] Note off {note}")
