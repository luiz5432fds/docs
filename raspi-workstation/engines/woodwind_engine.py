"""Stub engine for woodwind instrument sounds."""

from .base import BaseEngine


class WoodwindEngine(BaseEngine):
    def note_on(self, note: int, velocity: float) -> None:
        print(f"[Woodwind] Note on {note} vel={velocity}")

    def note_off(self, note: int) -> None:
        print(f"[Woodwind] Note off {note}")
