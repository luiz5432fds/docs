"""Stub engine for piano sounds."""

from .base import BaseEngine


class PianoEngine(BaseEngine):
    def note_on(self, note: int, velocity: float) -> None:
        print(f"[Piano] Note on {note} vel={velocity}")

    def note_off(self, note: int) -> None:
        print(f"[Piano] Note off {note}")
