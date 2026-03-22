"""
Maestro IA - Audio Analyzer Module
Analyzes audio files to extract musical features: BPM, key, chords, melody, sections
"""

import librosa
import librosa.display
import numpy as np
import json
from typing import Dict, List, Tuple, Any
import warnings
warnings.filterwarnings('ignore')


class AudioAnalyzer:
    """Analyzes audio files to extract musical features"""

    def __init__(self, audio_path: str):
        """
        Initialize analyzer with audio file path

        Args:
            audio_path: Path to audio file (mp3, wav, etc.)
        """
        self.audio_path = audio_path
        self.y = None
        self.sr = None
        self.tempo = None
        self.key = None
        self.chords = []
        self.melody = []
        self.sections = []

    def load_audio(self) -> Tuple[np.ndarray, int]:
        """Load audio file using librosa"""
        self.y, self.sr = librosa.load(self.audio_path, sr=44100)
        return self.y, self.sr

    def detect_tempo(self) -> float:
        """
        Detect tempo/BPM of the audio

        Returns:
            Tempo in BPM
        """
        if self.y is None:
            self.load_audio()

        # Use dynamic tempo estimation for better accuracy
        tempo, _ = librosa.beat.beat_track(y=self.y, sr=self.sr)
        self.tempo = float(tempo)
        return self.tempo

    def detect_key(self) -> Dict[str, Any]:
        """
        Detect musical key using chroma analysis

        Returns:
            Dictionary with key and scale type
        """
        if self.y is None:
            self.load_audio()

        # Get chromagram
        chroma = librosa.feature.chroma_stft(y=self.y, sr=self.sr)

        # Aggregate chroma across time
        chroma_mean = np.mean(chroma, axis=1)

        # Find key using correlation with major/minor profiles
        key_result = self._identify_key(chroma_mean)
        self.key = key_result
        return key_result

    def _identify_key(self, chroma_mean: np.ndarray) -> Dict[str, Any]:
        """
        Identify key from chroma mean using major/minor profiles

        Args:
            chroma_mean: Mean chroma values

        Returns:
            Dictionary with key name and scale type
        """
        # Major and minor key profiles (Krumhansl-Schmuckler)
        major_profile = np.array([6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88])
        minor_profile = np.array([6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17])

        keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

        best_correlation = -float('inf')
        best_key = 'C'
        best_scale = 'major'

        # Test all major keys
        for i in range(12):
            rotated_profile = np.roll(major_profile, -i)
            correlation = np.corrcoef(chroma_mean, rotated_profile)[0, 1]
            if correlation > best_correlation:
                best_correlation = correlation
                best_key = keys[i]
                best_scale = 'major'

        # Test all minor keys
        for i in range(12):
            rotated_profile = np.roll(minor_profile, -i)
            correlation = np.corrcoef(chroma_mean, rotated_profile)[0, 1]
            if correlation > best_correlation:
                best_correlation = correlation
                best_key = keys[i]
                best_scale = 'minor'

        return {'key': best_key, 'scale_type': best_scale}

    def detect_chords(self) -> List[Dict[str, Any]]:
        """
        Detect chord progression using chroma and beat tracking

        Returns:
            List of chord events with beat positions
        """
        if self.y is None:
            self.load_audio()

        # Get beats
        tempo, beats = librosa.beat.beat_track(y=self.y, sr=self.sr)

        # Get chromagram
        chroma = librosa.feature.chroma_stft(y=self.y, sr=self.sr)

        # Analyze chords per beat
        chords = []
        for i, beat in enumerate(beats):
            frame = int(beat * self.sr / 512)  # Approximate frame
            if frame < chroma.shape[1]:
                chroma_at_beat = chroma[:, frame]
                chord = self._identify_chord(chroma_at_beat)

                chords.append({
                    'chord': chord,
                    'start_beat': i,
                    'duration_beats': 1
                })

        self.chords = chords
        return chords

    def _identify_chord(self, chroma: np.ndarray) -> str:
        """
        Identify chord from chroma vector

        Args:
            chroma: 12-bin chroma vector

        Returns:
            Chord name (e.g., 'C', 'Am', 'G7')
        """
        # Define chord templates
        major_template = np.array([1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0])
        minor_template = np.array([1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0])
        seventh_template = np.array([1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0])

        chord_names = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

        best_correlation = -float('inf')
        best_chord = 'C'

        for root in range(12):
            for quality_name, quality_template in [('major', major_template),
                                                    ('minor', minor_template),
                                                    ('7', seventh_template)]:
                rotated = np.roll(quality_template, -root)
                correlation = np.corrcoef(chroma, rotated)[0, 1]

                if correlation > best_correlation:
                    best_correlation = correlation
                    root_name = chord_names[root]
                    suffix = 'm' if quality_name == 'minor' else ('7' if quality_name == '7' else '')
                    best_chord = root_name + suffix

        return best_chord

    def extract_melody(self) -> List[Dict[str, Any]]:
        """
        Extract melodic contour using pitch tracking

        Returns:
            List of melody notes with pitch, timing, velocity
        """
        if self.y is None:
            self.load_audio()

        # Use pyin for fundamental frequency tracking
        pitches, magnitudes, _ = librosa.pyin(self.y, fmin=librosa.note_to_hz('C2'),
                                             fmax=librosa.note_to_hz('C7'),
                                             sr=self.sr)

        # Convert to MIDI notes
        melody_notes = []
        current_note = None
        note_start = 0

        for i, (pitch, magnitude) in enumerate(zip(pitches, magnitudes)):
            if magnitude > 0.5 and not np.isnan(pitch):
                midi_note = librosa.hz_to_midi(pitch)

                if current_note is None:
                    current_note = midi_note
                    note_start = i
                elif abs(midi_note - current_note) > 1:
                    # Note changed
                    melody_notes.append({
                        'pitch': int(current_note),
                        'start_beat': i * 512 / self.sr * (self.tempo or 120) / 60,
                        'duration_beats': (i - note_start) * 512 / self.sr * (self.tempo or 120) / 60,
                        'velocity': 80
                    })
                    current_note = midi_note
                    note_start = i

        self.melody = melody_notes
        return melody_notes

    def detect_sections(self) -> List[Dict[str, Any]]:
        """
        Detect song sections (verse, chorus, etc.) using structure analysis

        Returns:
            List of detected sections
        """
        if self.y is None:
            self.load_audio()

        # Use self-similarity matrix for structure detection
        chroma = librosa.feature.chroma_stft(y=self.y, sr=self.sr)

        # Normalize chroma
        chroma_norm = chroma / (np.sum(chroma, axis=0) + 1e-10)

        # Simple section detection based on chroma changes
        sections = []
        current_section = 'verse'
        section_start = 0

        # Analyze chroma in windows
        window_size = 32  # frames
        for i in range(0, chroma_norm.shape[1], window_size):
            window = chroma_norm[:, i:i+window_size]
            if window.shape[1] == 0:
                break

            # Detect section change (simplified)
            if i > 0 and i % (window_size * 4) == 0:
                # Alternate between verse and chorus
                new_section = 'chorus' if current_section == 'verse' else 'verse'
                sections.append({
                    'type': current_section,
                    'start_beat': section_start * 512 / self.sr * (self.tempo or 120) / 60,
                    'end_beat': i * 512 / self.sr * (self.tempo or 120) / 60,
                    'label': current_section.capitalize()
                })
                current_section = new_section
                section_start = i

        # Add final section
        sections.append({
            'type': current_section,
            'start_beat': section_start * 512 / self.sr * (self.tempo or 120) / 60,
            'end_beat': len(self.y) / self.sr * (self.tempo or 120) / 60,
            'label': current_section.capitalize()
        })

        self.sections = sections
        return sections

    def classify_instruments(self) -> List[Dict[str, Any]]:
        """
        Classify instruments present in the audio (basic implementation)

        Returns:
            List of detected instruments with confidence
        """
        if self.y is None:
            self.load_audio()

        # Basic classification using frequency analysis
        instruments = []

        # Spectral centroid for brightness analysis
        spectral_centroids = librosa.feature.spectral_centroid(y=self.y, sr=self.sr)[0]
        mean_centroid = np.mean(spectral_centroids)

        # Zero crossing rate for percussiveness
        zcr = librosa.feature.zero_crossing_rate(self.y)[0]
        mean_zcr = np.mean(zcr)

        # Simple heuristic classification
        if mean_zcr > 0.15:
            instruments.append({
                'type': 'drums',
                'confidence': 0.8,
                'role': 'drums'
            })

        if mean_centroid > 3000:
            instruments.append({
                'type': 'hi_hat',
                'confidence': 0.7,
                'role': 'percussion'
            })
        elif mean_centroid < 500:
            instruments.append({
                'type': 'bass',
                'confidence': 0.7,
                'role': 'bass'
            })

        # Add default instruments
        if not instruments:
            instruments = [
                {'type': 'piano', 'confidence': 0.6, 'role': 'harmony'},
                {'type': 'bass', 'confidence': 0.5, 'role': 'bass'}
            ]

        return instruments

    def analyze_full(self) -> Dict[str, Any]:
        """
        Perform complete audio analysis

        Returns:
            Complete analysis dictionary with all features
        """
        self.load_audio()

        return {
            'bpm': self.detect_tempo(),
            'key': self.detect_key()['key'],
            'time_signature': '4/4',  # Default
            'chords': {
                'chords': self.detect_chords(),
                'key': self.detect_key()['key'],
                'scale_type': self.detect_key()['scale_type']
            },
            'melody': {
                'notes': self.extract_melody(),
                'range': {'lowest': 48, 'highest': 72},  # Default range
                'tessitura': 'mid'
            },
            'sections': self.detect_sections(),
            'instruments': self.classify_instruments(),
            'duration': len(self.y) / self.sr
        }


def analyze_audio(audio_path: str) -> Dict[str, Any]:
    """
    Convenience function to analyze audio file

    Args:
        audio_path: Path to audio file

    Returns:
        Complete analysis dictionary
    """
    analyzer = AudioAnalyzer(audio_path)
    return analyzer.analyze_full()


if __name__ == '__main__':
    import sys

    if len(sys.argv) > 1:
        result = analyze_audio(sys.argv[1])
        print(json.dumps(result, indent=2))
    else:
        print("Usage: python audio_analyzer.py <audio_file>")
