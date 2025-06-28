"""Stub engine for organ sounds."""

from .base import BaseEngine


class OrganEngine(BaseEngine):
    def note_on(self, note: int, velocity: float) -> None:
        print(f"[Organ] Note on {note} vel={velocity}")

    def note_off(self, note: int) -> None:
        print(f"[Organ] Note off {note}")
