"""Stub engine inspired by Korg M50/M1 series."""

from .base import BaseEngine


class KorgMEngine(BaseEngine):
    def note_on(self, note: int, velocity: float) -> None:
        print(f"[Korg M] Note on {note} vel={velocity}")

    def note_off(self, note: int) -> None:
        print(f"[Korg M] Note off {note}")
