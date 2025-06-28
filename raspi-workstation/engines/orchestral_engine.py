"""Stub engine for orchestral sounds."""

from .base import BaseEngine


class OrchestralEngine(BaseEngine):
    def note_on(self, note: int, velocity: float) -> None:
        print(f"[Orchestral] Note on {note} vel={velocity}")

    def note_off(self, note: int) -> None:
        print(f"[Orchestral] Note off {note}")
