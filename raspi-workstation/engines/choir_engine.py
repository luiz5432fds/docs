"""Stub engine for choir sounds."""

from .base import BaseEngine


class ChoirEngine(BaseEngine):
    def note_on(self, note: int, velocity: float) -> None:
        print(f"[Choir] Note on {note} vel={velocity}")

    def note_off(self, note: int) -> None:
        print(f"[Choir] Note off {note}")
