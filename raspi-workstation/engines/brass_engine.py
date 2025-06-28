"""Stub engine for brass instrument sounds."""

from .base import BaseEngine


class BrassEngine(BaseEngine):
    def note_on(self, note: int, velocity: float) -> None:
        print(f"[Brass] Note on {note} vel={velocity}")

    def note_off(self, note: int) -> None:
        print(f"[Brass] Note off {note}")
