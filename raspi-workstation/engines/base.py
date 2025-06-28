from abc import ABC, abstractmethod
from typing import Any


class BaseEngine(ABC):
    """Base class for all sound engines."""

    @abstractmethod
    def note_on(self, note: int, velocity: float) -> Any:
        """Start playing a note."""
        raise NotImplementedError

    @abstractmethod
    def note_off(self, note: int) -> Any:
        """Stop playing a note."""
        raise NotImplementedError
