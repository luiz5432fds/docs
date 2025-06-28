"""Stub engine for FM synthesis sounds."""

from .base import BaseEngine


class FmEngine(BaseEngine):
    def note_on(self, note: int, velocity: float) -> None:
        print(f"[FM] Note on {note} vel={velocity}")

    def note_off(self, note: int) -> None:
        print(f"[FM] Note off {note}")
