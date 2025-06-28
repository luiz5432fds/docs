"""Stub engine for accordion sounds."""

from .base import BaseEngine


class AccordionEngine(BaseEngine):
    def note_on(self, note: int, velocity: float) -> None:
        print(f"[Accordion] Note on {note} vel={velocity}")

    def note_off(self, note: int) -> None:
        print(f"[Accordion] Note off {note}")
