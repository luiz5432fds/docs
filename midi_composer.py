#!/usr/bin/env python3
"""
midi_composer.py - Serviço de Composição MIDI com IA

Gera músicas baseadas em padrões de gêneros brasileiros e clássicos.
Usa o conhecimento aprendido dos PDFs e análise de áudio.
"""

import os
import json
from pathlib import Path
from typing import List, Dict, Any, Optional, Tuple
from dataclasses import dataclass, field
from enum import Enum
import random
from itertools import cycle

# MIDI generation
import midiutil
from midiutil import MIDIFile

# Audio analysis integration
import numpy as np


class Genre(Enum):
    """Gêneros musicais suportados"""
    FREVO = "frevo"
    MARACATU = "maracatu"
    SAMBA = "samba"
    CHORO = "choro"
    BOSSA_NOVA = "bossa_nova"
    BREGA = "brega"
    PISEIRO = "piseiro"
    AXE = "axe"
    CALYPSO = "calypso"
    CUMBIA = "cumbia"
    BAIAO = "baiao"
    FORRO = "forro"
    XAXADO = "xaxado"
    XOTE = "xote"

    BAROQUE = "baroque"
    CLASSICAL = "classical"
    ROMANTIC = "romantic"
    MODERN = "modern"


@dataclass
class Note:
    """Nota musical"""
    pitch: int  # MIDI note number (0-127)
    start_time: float  # In beats
    duration: float  # In beats
    velocity: int  # 0-127
    channel: int = 0


@dataclass
class RhythmPattern:
    """Padrão rítmico"""
    name: str
    pattern: List[float]  # Onsets in beats
    division: int  # Subdivisão (4 = sixteenth notes)
    swing: float = 0.0  # Swing amount (0-1)


@dataclass
class Chord:
    """Acorde"""
    name: str
    pitches: List[int]  # MIDI note numbers (relative to root)
    function: str  # tonic, subdominant, dominant, etc.


@dataclass
class Progression:
    """Progressão de acordes"""
    chords: List[Tuple[str, float]]  # (chord_name, duration_in_beats)


@dataclass
class Composition:
    """Composição completa"""
    title: str
    genre: Genre
    tempo: int
    time_signature: Tuple[int, int]  # (numerator, denominator)
    key: str
    notes: List[Note] = field(default_factory=list)


# Musical constants

NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

SCALE_DEGREES = {
    'major': [0, 2, 4, 5, 7, 9, 11],  # Major scale intervals
    'minor': [0, 2, 3, 5, 7, 8, 10],  # Natural minor
    'harmonic_minor': [0, 2, 3, 5, 7, 8, 11],  # Harmonic minor
    'melodic_minor': [0, 2, 3, 5, 7, 9, 11],  # Melodic minor (ascending)
    'pentatonic_major': [0, 2, 4, 7, 9],
    'pentatonic_minor': [0, 3, 5, 7, 10],
    'blues': [0, 3, 5, 6, 7, 10],
    'dorian': [0, 2, 3, 5, 7, 9, 10],
    'mixolydian': [0, 2, 4, 5, 7, 9, 10],
    'phrygian': [0, 1, 3, 5, 7, 8, 10],
    'lydian': [0, 2, 4, 6, 7, 9, 11],
}

CHORD_QUALITIES = {
    'major': [0, 4, 7],  # Major triad
    'minor': [0, 3, 7],  # Minor triad
    'diminished': [0, 3, 6],  # Diminished triad
    'augmented': [0, 4, 8],  # Augmented triad
    'maj7': [0, 4, 7, 11],  # Major 7th
    'min7': [0, 3, 7, 10],  # Minor 7th
    '7': [0, 4, 7, 10],  # Dominant 7th
    'min7b5': [0, 3, 6, 10],  # Half-diminished
    'dim7': [0, 3, 6, 9],  # Fully diminished
    'sus4': [0, 5, 7],  # Sus 4
    'sus2': [0, 2, 7],  # Sus 2
    '6': [0, 4, 7, 9],  # Major 6th
    'min6': [0, 3, 7, 9],  # Minor 6th
}

# Genre-specific configurations

GENRE_CONFIGS = {
    Genre.FREVO: {
        'tempo': (130, 145),
        'time_signature': (2, 4),
        'scale': 'major',
        'typical_chords': ['major', '7', 'maj7'],
        'rhythm_pattern': [0, 0.5, 1, 1.5],  # Eighth notes, march-like
        'characteristics': 'syncopated brass melodies, fast tempo',
    },
    Genre.MARACATU: {
        'tempo': (110, 125),
        'time_signature': (4, 4),
        'scale': 'major',
        'typical_chords': ['major', 'min7', '7'],
        'rhythm_pattern': [0, 1, 2, 2.5, 3],  # Slow clave-like
        'characteristics': 'heavy drums, call-and-response',
    },
    Genre.SAMBA: {
        'tempo': (100, 120),
        'time_signature': (2, 4),
        'scale': 'major',
        'typical_chords': ['maj7', 'min7', '7', 'min7b5'],
        'rhythm_pattern': [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5],  # Syncopated
        'swing': 0.2,
        'characteristics': 'syncopated guitar, percussion-driven',
    },
    Genre.CHORO: {
        'tempo': (85, 100),
        'time_signature': (2, 4),
        'scale': 'major',
        'typical_chords': ['major', 'min7', '7', 'dim7'],
        'rhythm_pattern': [0, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75],  # Fast
        'characteristics': 'fast, virtuosic, contrapuntal',
    },
    Genre.BOSSA_NOVA: {
        'tempo': (110, 130),
        'time_signature': (4, 4),
        'scale': 'major',
        'typical_chords': ['maj7', 'min7', '7', 'min7b5', 'maj7#11'],
        'rhythm_pattern': [0, 1, 2, 3],  # Quarter note feel with syncopation
        'swing': 0.1,
        'characteristics': 'soft, syncopated guitar, jazz-influenced',
    },
    Genre.BREGA: {
        'tempo': (85, 105),
        'time_signature': (4, 4),
        'scale': 'major',
        'typical_chords': ['major', 'min7', 'sus4', '6'],
        'rhythm_pattern': [0, 1, 2, 3],  # Straight
        'characteristics': 'romantic, electronic elements',
    },
    Genre.PISEIRO: {
        'tempo': (135, 160),
        'time_signature': (4, 4),
        'scale': 'pentatonic_major',
        'typical_chords': ['major', 'sus4', '7'],
        'rhythm_pattern': [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5],
        'characteristics': 'very fast, repetitive, dance-oriented',
    },
    Genre.BAIAO: {
        'tempo': (90, 110),
        'time_signature': (2, 4),
        'scale': 'pentatonic_major',
        'typical_chords': ['major', '7', 'sus4'],
        'rhythm_pattern': [0, 0.75, 1.5, 2.25],  # Baião rhythm
        'characteristics': 'northeastern Brazil, accordion-driven',
    },
    Genre.CLASSICAL: {
        'tempo': (60, 140),
        'time_signature': (4, 4),
        'scale': 'major',
        'typical_chords': ['major', 'min7', '7', 'dim7', 'augmented'],
        'rhythm_pattern': [],  # Variable
        'characteristics': 'follows classical forms and counterpoint',
    },
}


class MusicTheory:
    """Classe utilitária para teoria musical"""

    @staticmethod
    def note_to_midi(note_name: str, octave: int = 4) -> int:
        """Converte nome da nota (ex: 'C#4') para número MIDI"""
        note = note_name.rstrip('0123456789')
        oct_str = note_name[len(note):]
        if oct_str:
            octave = int(oct_str)

        note_index = NOTE_NAMES.index(note)
        return 12 * (octave + 1) + note_index

    @staticmethod
    def midi_to_note(midi_note: int) -> str:
        """Converte número MIDI para nome da nota"""
        note = NOTE_NAMES[midi_note % 12]
        octave = (midi_note // 12) - 1
        return f"{note}{octave}"

    @staticmethod
    def get_scale(root: int, scale_type: str) -> List[int]:
        """Retorna escala a partir da nota raiz"""
        intervals = SCALE_DEGREES.get(scale_type, SCALE_DEGREES['major'])
        return [(root + interval) % 12 for interval in intervals]

    @staticmethod
    def get_chord(root: int, quality: str) -> List[int]:
        """Retorna notas do acorde"""
        intervals = CHORD_QUALITIES.get(quality, CHORD_QUALITIES['major'])
        return [(root + interval) for interval in intervals]

    @staticmethod
    def get_diatonic_chords(key_root: int, scale_type: str = 'major') -> Dict[str, List[int]]:
        """Retorna acordes diatônicos da tonalidade"""
        scale = MusicTheory.get_scale(key_root, scale_type)
        chords = {}

        qualities_by_degree = {
            'major': ['major', 'minor', 'minor', 'major', 'major', 'minor', 'diminished'],
            'minor': ['minor', 'diminished', 'major', 'minor', 'minor', 'major', 'major'],
            'harmonic_minor': ['minor', 'diminished', 'augmented', 'minor', 'major', 'major', 'diminished'],
        }

        qualities = qualities_by_degree.get(scale_type, qualities_by_degree['major'])
        roman_numerals = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°']

        for i, (scale_note, quality, roman) in enumerate(zip(scale, qualities, roman_numerals)):
            chord = MusicTheory.get_chord(scale_note, quality)
            chords[roman] = chord

        return chords


class MIDIGenerator:
    """Gerador de arquivos MIDI"""

    def __init__(self, num_tracks: int = 1):
        self.midi = MIDIFile(num_tracks)
        self.num_tracks = num_tracks

    def add_track(self, track_num: int, name: str, channel: int = 0, tempo: int = 120):
        """Configura uma track"""
        self.midi.addTrackName(track_num, 0, name)
        self.midi.setTempo(track_num, tempo)
        self.midi.addProgramChange(track_num, channel, 0, 0)  # Grand Piano default

    def add_note(self, track: int, channel: int, note: Note):
        """Adiciona uma nota"""
        self.midi.addNote(
            track, channel, note.pitch,
            int(note.start_time * 480),  # Convert beats to ticks (480 PPQ)
            int(note.duration * 480),
            note.velocity
        )

    def add_notes(self, track: int, channel: int, notes: List[Note]):
        """Adiciona múltiplas notas"""
        for note in notes:
            self.add_note(track, channel, note)

    def add_chord(self, track: int, channel: int, pitches: List[int],
                  start_time: float, duration: float, velocity: int = 80):
        """Adiciona um acorde (notas simultâneas)"""
        for pitch in pitches:
            note = Note(pitch, start_time, duration, velocity, channel)
            self.add_note(track, channel, note)

    def save(self, filepath: Path):
        """Salva o arquivo MIDI"""
        with open(filepath, 'wb') as f:
            self.midi.writeFile(f)
        print(f"🎹 MIDI salvo: {filepath}")


class AIComposer:
    """
    Compositor de IA especializado em música brasileira e clássica

    Usa conhecimento aprendido e padrões rítmicos/harmônicos específicos.
    """

    def __init__(self):
        self.theory = MusicTheory()

    def generate_composition(
        self,
        genre: Genre,
        tempo: Optional[int] = None,
        key: str = "C",
        length_bars: int = 32,
        mood: str = "neutral"
    ) -> Composition:
        """
        Gera uma composição baseada no gênero

        Args:
            genre: Gênero musical
            tempo: BPM (None = auto based on genre)
            key: Tonalidade (ex: "C", "Am", "F#")
            length_bars: Duração em compassos
            mood: Clima desejado

        Returns:
            Composition object
        """
        config = GENRE_CONFIGS.get(genre, GENRE_CONFIGS[Genre.SAMBA])

        # Set tempo
        if tempo is None:
            tempo = random.randint(*config['tempo'])

        # Parse key
        key_root = self.theory.note_to_midi(key[0]) if key[0].isalpha() else 60
        scale_type = 'minor' if 'm' in key.lower() else config['scale']

        # Create composition
        composition = Composition(
            title=f"AI Maestro - {genre.value.title()}",
            genre=genre,
            tempo=tempo,
            time_signature=config['time_signature'],
            key=key,
        )

        # Generate chord progression
        progression = self._generate_progression(genre, key_root, scale_type, length_bars)

        # Generate melody based on genre
        melody = self._generate_melody(genre, progression, key_root, scale_type, mood)

        # Generate bass line
        bass = self._generate_bass(genre, progression, key_root, scale_type)

        # Generate rhythm section
        rhythm = self._generate_rhythm(genre, progression, tempo)

        # Combine all parts
        composition.notes.extend(melody)
        composition.notes.extend(bass)
        composition.notes.extend(rhythm)

        return composition

    def _generate_progression(
        self,
        genre: Genre,
        key_root: int,
        scale_type: str,
        length_bars: int
    ) -> List[Tuple[str, float]]:
        """Gera progressão de acordes"""
        diatonic = self.theory.get_diatonic_chords(key_root, scale_type)

        # Genre-specific progressions
        progressions = {
            Genre.FREVO: [('I', 2), ('IV', 2), ('V', 2), ('I', 2)],
            Genre.SAMBA: [('I', 2), ('vi', 2), ('ii', 2), ('V', 2), ('I', 4), ('V', 4)],
            Genre.CHORO: [('I', 2), ('V', 2), ('I', 2), ('V7', 2), ('I', 4)],
            Genre.BOSSA_NOVA: [('Imaj7', 4), ('ii7', 4), ('V7', 4), ('Imaj7', 4)],
            Genre.BREGA: [('I', 4), ('V', 4), ('vi', 4), ('IV', 4)],
            Genre.PISEIRO: [('I', 4), ('IV', 4), ('I', 4), ('V', 4)],
            Genre.CLASSICAL: [('I', 4), ('IV', 4), ('V', 4), ('I', 4)],
        }

        base_progression = progressions.get(genre, progressions[Genre.SAMBA])

        # Extend to length
        full_progression = []
        bars_covered = 0

        while bars_covered < length_bars:
            for chord, duration in base_progression:
                full_progression.append((chord, duration))
                bars_covered += duration
                if bars_covered >= length_bars:
                    break

        return full_progression[:length_bars]

    def _generate_melody(
        self,
        genre: Genre,
        progression: List[Tuple[str, float]],
        key_root: int,
        scale_type: str,
        mood: str
    ) -> List[Note]:
        """Gera melodia baseada na progressão"""
        melody = []
        current_beat = 0
        scale = self.theory.get_scale(key_root, scale_type)
        scale_octaves = [n + 12 * o for n in scale for o in range(3, 6)]  # 3 octaves

        config = GENRE_CONFIGS.get(genre, GENRE_CONFIGS[Genre.SAMBA])
        rhythm_pattern = config.get('rhythm_pattern', [0, 0.5, 1, 1.5])

        for chord_name, duration in progression:
            # Generate melody for this chord
            chord_root = self.theory.note_to_midi(chord_name[0]) if chord_name[0] in NOTE_NAMES else key_root

            # Melody characteristics by genre
            if genre in [Genre.FREVO, Genre.CHORO]:
                # Fast, virtuosic
                notes_per_chord = int(duration * 4)
                velocity_base = 100
            elif genre == Genre.BOSSA_NOVA:
                # Smooth, lyrical
                notes_per_chord = int(duration * 2)
                velocity_base = 80
            else:
                notes_per_chord = int(duration * 2)
                velocity_base = 90

            for i in range(notes_per_chord):
                # Choose note from scale (prefer chord tones)
                if i == 0 or i % 4 == 0:
                    # Chord tone on strong beats
                    pitch = random.choice([n for n in scale_octaves if n % 12 == chord_root % 12])
                else:
                    # Scale tone
                    pitch = random.choice(scale_octaves)

                # Rhythm
                if rhythm_pattern:
                    beat_offset = rhythm_pattern[i % len(rhythm_pattern)] % 1
                else:
                    beat_offset = (i / notes_per_chord) * duration

                note = Note(
                    pitch=pitch,
                    start_time=current_beat + beat_offset,
                    duration=0.5 if genre in [Genre.FREVO, Genre.CHORO] else 1.0,
                    velocity=random.randint(velocity_base - 20, velocity_base),
                    channel=0
                )
                melody.append(note)

            current_beat += duration

        return melody

    def _generate_bass(
        self,
        genre: Genre,
        progression: List[Tuple[str, float]],
        key_root: int,
        scale_type: str
    ) -> List[Note]:
        """Gera linha de baixo"""
        bass = []
        current_beat = 0

        for chord_name, duration in progression:
            # Get root of chord
            bass_note = key_root  # Simplified

            # Bass pattern by genre
            if genre == Genre.BOSSA_NOVA:
                # Bossa nova bass - syncopated
                for i in range(int(duration)):
                    note = Note(
                        pitch=bass_note,
                        start_time=current_beat + i + 0.5,
                        duration=1,
                        velocity=70,
                        channel=1
                    )
                    bass.append(note)
            elif genre in [Genre.SAMBA, Genre.FREVO]:
                # Root on beat 1
                note = Note(
                    pitch=bass_note,
                    start_time=current_beat,
                    duration=duration,
                    velocity=80,
                    channel=1
                )
                bass.append(note)
            else:
                # Simple root
                note = Note(
                    pitch=bass_note,
                    start_time=current_beat,
                    duration=duration,
                    velocity=75,
                    channel=1
                )
                bass.append(note)

            current_beat += duration

        return bass

    def _generate_rhythm(
        self,
        genre: Genre,
        progression: List[Tuple[str, float]],
        tempo: int
    ) -> List[Note]:
        """Gera padrão rítmico/percussão"""
        rhythm = []
        current_beat = 0

        # Percussion MIDI notes (GM standard)
        PERCUSSION = {
            'acoustic_bass_drum': 35,
            'bass_drum_1': 36,
            'side_stick': 37,
            'acoustic_snare': 38,
            'hand_clap': 39,
            'electric_snare': 40,
            'low_floor_tom': 41,
            'closed_hi_hat': 42,
            'high_floor_tom': 43,
            'pedal_hi_hat': 44,
            'low_tom': 45,
            'open_hi_hat': 46,
            'low_mid_tom': 47,
            'hi_mid_tom': 48,
            'crash_cymbal_1': 49,
            'high_tom': 50,
            'ride_cymbal_1': 51,
            'chinese_cymbal': 52,
        }

        for chord_name, duration in progression:
            # Genre-specific rhythm
            if genre == Genre.SAMBA:
                # Samba pattern (simplified)
                for i in range(int(duration * 2)):
                    rhythm.append(Note(
                        pitch=PERCUSSION['closed_hi_hat'],
                        start_time=current_beat + i * 0.5,
                        duration=0.25,
                        velocity=60,
                        channel=9  # Percussion channel
                    ))
                rhythm.append(Note(
                    pitch=PERCUSSION['acoustic_bass_drum'],
                    start_time=current_beat,
                    duration=1,
                    velocity=80,
                    channel=9
                ))

            elif genre == Genre.BOSSA_NOVA:
                # Bossa nova rhythm
                rhythm.append(Note(
                    pitch=PERCUSSION['closed_hi_hat'],
                    start_time=current_beat + 0.5,
                    duration=0.5,
                    velocity=50,
                    channel=9
                ))
                rhythm.append(Note(
                    pitch=PERCUSSION['acoustic_bass_drum'],
                    start_time=current_beat,
                    duration=2,
                    velocity=70,
                    channel=9
                ))

            elif genre == Genre.FREVO:
                # Frevo march-like
                for i in range(int(duration * 2)):
                    rhythm.append(Note(
                        pitch=PERCUSSION['acoustic_snare'],
                        start_time=current_beat + i * 0.5,
                        duration=0.25,
                        velocity=70,
                        channel=9
                    ))
                rhythm.append(Note(
                    pitch=PERCUSSION['acoustic_bass_drum'],
                    start_time=current_beat,
                    duration=1,
                    velocity=90,
                    channel=9
                ))

            current_beat += duration

        return rhythm

    def composition_to_midi(self, composition: Composition, output_path: Path) -> Path:
        """Converte composição em arquivo MIDI"""
        # Group notes by channel
        notes_by_channel = {}
        for note in composition.notes:
            if note.channel not in notes_by_channel:
                notes_by_channel[note.channel] = []
            notes_by_channel[note.channel].append(note)

        # Create MIDI file
        num_tracks = len(notes_by_channel)
        generator = MIDIGenerator(num_tracks)

        # Add tracks
        for track_idx, (channel, notes) in enumerate(sorted(notes_by_channel.items())):
            track_names = {
                0: "Melody",
                1: "Bass",
                9: "Percussion",
                2: "Chords",
                3: "Pad",
            }
            generator.add_track(
                track_idx,
                track_names.get(channel, f"Track {channel}"),
                channel,
                composition.tempo
            )
            generator.add_notes(track_idx, channel, notes)

        # Save
        output_path = Path(output_path)
        output_path.parent.mkdir(parents=True, exist_ok=True)
        generator.save(output_path)

        return output_path


def main():
    """CLI para testar composição"""
    print("🎼 AI Maestro - MIDI Composer")
    print("=" * 50)

    composer = AIComposer()

    # Generate a sample composition
    print("\n🎵 Gerando Samba...")
    composition = composer.generate_composition(
        genre=Genre.SAMBA,
        tempo=110,
        key="C",
        length_bars=16,
        mood="festive"
    )

    output_path = Path("projetos/test_samba.mid")
    composer.composition_to_midi(composition, output_path)

    print(f"\n✅ Composição gerada!")
    print(f"   Título: {composition.title}")
    print(f"   Gênero: {composition.genre.value}")
    print(f"   BPM: {composition.tempo}")
    print(f"   Compasso: {composition.time_signature[0]}/{composition.time_signature[1]}")
    print(f"   Tonalidade: {composition.key}")
    print(f"   Notas: {len(composition.notes)}")
    print(f"   Arquivo: {output_path}")


if __name__ == "__main__":
    main()
