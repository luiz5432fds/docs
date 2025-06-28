"""Stub engine inspired by the Roland XP-80."""

from .base import BaseEngine


class Xp80Engine(BaseEngine):
    def note_on(self, note: int, velocity: float) -> None:
        print(f"[XP-80] Note on {note} vel={velocity}")

    def note_off(self, note: int) -> None:
        print(f"[XP-80] Note off {note}")
