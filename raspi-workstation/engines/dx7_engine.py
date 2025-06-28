"""Stub engine inspired by the Yamaha DX7."""

from .base import BaseEngine


class Dx7Engine(BaseEngine):
    def note_on(self, note: int, velocity: float) -> None:
        print(f"[DX7] Note on {note} vel={velocity}")

    def note_off(self, note: int) -> None:
        print(f"[DX7] Note off {note}")
