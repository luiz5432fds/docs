"""Stub engine inspired by the Roland D-50."""

from .base import BaseEngine


class D50Engine(BaseEngine):
    def note_on(self, note: int, velocity: float) -> None:
        print(f"[D-50] Note on {note} vel={velocity}")

    def note_off(self, note: int) -> None:
        print(f"[D-50] Note off {note}")
