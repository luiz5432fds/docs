"""
Maestro IA - MuseScore Integration Module
Generates sheet music using music21 and exports to MusicXML/PDF
"""

from music21 import stream, score, note, chord, meter, key as music21key, tempo, instrument
import music21
from typing import Dict, List, Any, Optional
import os
import subprocess


class MuseScoreIntegration:
    """Handles MusicXML generation and MuseScore export"""

    def __init__(self, output_dir: Optional[str] = None):
        """
        Initialize MuseScore integration

        Args:
            output_dir: Directory for output files (default: ./output/scores)
        """
        self.output_dir = output_dir or self._get_default_output_dir()
        os.makedirs(self.output_dir, exist_ok=True)

    def _get_default_output_dir(self) -> str:
        """Get default output directory"""
        base_dir = os.path.dirname(os.path.dirname(__file__))
        return os.path.join(base_dir, 'output', 'scores')

    def create_score(self, arrangement: Dict[str, Any]) -> music21.stream.Score:
        """
        Create a music21 Score from arrangement

        Args:
            arrangement: Musical arrangement dictionary

        Returns:
            music21.stream.Score object
        """
        s = music21.stream.Score()
        s.metadata = music21.metadata.Metadata()
        s.metadata.title = f"Maestro - {arrangement.get('style', 'Arrangement')}"
        s.metadata.composer = "Maestro IA"

        # Get arrangement parameters
        tempo_val = arrangement.get('tempo', 120)
        time_sig = arrangement.get('timeSignature', '4/4')
        key_name = arrangement.get('key', 'C')

        # Parse time signature
        ts_beats, ts_type = map(int, time_sig.split('/'))

        # Add parts for each instrument
        instruments_list = arrangement.get('instruments', [])

        for inst_data in instruments_list:
            part = self._create_part(inst_data, arrangement, ts_beats, ts_type, tempo_val)
            s.insert(0, part)

        return s

    def _create_part(
        self,
        inst_data: Dict[str, Any],
        arrangement: Dict[str, Any],
        ts_beats: int,
        ts_type: int,
        tempo_val: int
    ) -> music21.stream.Part:
        """Create a part for a single instrument"""

        part = music21.stream.Part()
        part.id = inst_data.get('name', 'Instrument')

        # Add instrument
        m21_inst = self._get_music21_instrument(inst_data.get('name', ''))
        part.insert(0, m21_inst)

        # Create measure stream
        m = music21.stream.Measure(number=1)

        # Add time signature
        m.insert(0, meter.TimeSignature(f'{ts_beats}/{ts_type}'))

        # Add key signature
        key_sig = self._get_key_signature(arrangement.get('key', 'C'))
        m.insert(0, key_sig)

        # Add tempo
        m.insert(0, tempo.MetronomeMark(number=tempo_val))

        # Add notes based on harmony
        harmony = arrangement.get('harmony', {})
        chords = harmony.get('chords', [])

        if chords:
            # Generate notes from chord progression
            notes = self._chords_to_notes(chords, key_sig)
        else:
            # Default: add a whole note
            n = note.Note('C4', quarterLength=ts_beats)
            notes = [n]

        for n in notes:
            m.insert(n.offset if hasattr(n, 'offset') else 0, n)

        part.append(m)

        # Add more measures for a complete score
        total_measures = 32  # Default length
        for i in range(2, total_measures + 1):
            m = music21.stream.Measure(number=i)
            for n in notes:
                m.insert(n.offset if hasattr(n, 'offset') else 0, n)
            part.append(m)

        return part

    def _get_music21_instrument(self, name: str) -> music21.instrument.Instrument:
        """Get music21 instrument object from name"""
        name_lower = name.lower()

        instrument_map = {
            'piano': music21.instrument.Piano(),
            'acoustic piano': music21.instrument.Piano(),
            'grand piano': music21.instrument.Piano(),
            'electric piano': music21.instrument.Piano(),
            'guitar': music21.instrument.AcousticGuitar(),
            'acoustic guitar': music21.instrument.AcousticGuitar(),
            'nylon guitar': music21.instrument.AcousticGuitar(),
            'electric guitar': music21.instrument.ElectricGuitar(),
            'bass': music21.instrument.AcousticBass(),
            'electric bass': music21.instrument.ElectricBass(),
            'upright bass': music21.instrument.AcousticBass(),
            'drums': music21.instrument.UnpitchedPercussion(),
            'drum set': music21.instrument.UnpitchedPercussion(),
            'percussion': music21.instrument.UnpitchedPercussion(),
            'strings': music21.instrument.StringSection(),
            'strings ensemble': music21.instrument.StringSection(),
            'trumpet': music21.instrument.Trumpet(),
            'sax': music21.instrument.Saxophone(),
            'tenor sax': music21.instrument.Saxophone(),
            'flute': music21.instrument.Flute(),
            'clarinet': music21.instrument.Clarinet(),
            'accordion': music21.instrument.Accordion(),
            'organ': music21.instrument.Organ(),
        }

        for key, inst in instrument_map.items():
            if key in name_lower:
                return inst

        return music21.instrument.Instrument()

    def _get_key_signature(self, key_name: str) -> music21.key.Key:
        """Get music21 key object from key name"""
        try:
            return music21key.Key(key_name)
        except:
            return music21key.Key('C')

    def _chords_to_notes(
        self,
        chords: List[Dict[str, Any]],
        key_sig: music21key.Key
    ) -> List[music21.general.Note]:
        """Convert chord progression to music21 notes"""

        notes = []
        offset = 0

        for chord_data in chords:
            chord_name = chord_data.get('chord', 'C')
            duration = chord_data.get('durationBeats', 4)

            # Parse chord name
            root_note = chord_name[0]
            quality = 'minor' if 'm' in chord_name else 'major'

            # Create chord object
            try:
                c = chord.Chord(root_note + '4')  # Root in octave 4

                # Add chord tones
                if quality == 'minor':
                    c.pitches = [
                        music21.pitch.Pitch(root_note + '4'),
                        music21.pitch.Pitch(root_note + '4').transpose('m3'),
                        music21.pitch.Pitch(root_note + '4').transpose('P5'),
                    ]
                else:
                    c.pitches = [
                        music21.pitch.Pitch(root_note + '4'),
                        music21.pitch.Pitch(root_note + '4').transpose('M3'),
                        music21.pitch.Pitch(root_note + '4').transpose('P5'),
                    ]

                c.duration = music21.duration.Duration(duration)
                c.offset = offset

                notes.append(c)
                offset += duration

            except Exception as e:
                # Fallback to single note
                n = note.Note(root_note + '4', quarterLength=duration)
                n.offset = offset
                notes.append(n)
                offset += duration

        return notes

    def export_musicxml(self, score: music21.stream.Score, filename: Optional[str] = None) -> str:
        """
        Export score as MusicXML file

        Args:
            score: music21 Score object
            filename: Output filename (optional)

        Returns:
            Path to created MusicXML file
        """
        if filename is None:
            filename = f"maestro_score_{self._get_timestamp()}.musicxml"

        filepath = os.path.join(self.output_dir, filename)

        score.write('musicxml', fp=filepath)

        return filepath

    def export_pdf(
        self,
        score: music21.stream.Score,
        filename: Optional[str] = None,
        use_musescore: bool = True
    ) -> str:
        """
        Export score as PDF

        Args:
            score: music21 Score object
            filename: Output filename (optional)
            use_musescore: Use MuseScore for export (better quality)

        Returns:
            Path to created PDF file
        """
        if filename is None:
            filename = f"maestro_score_{self._get_timestamp()}.pdf"

        filepath = os.path.join(self.output_dir, filename)

        if use_musescore:
            # Export via MusicXML first, then convert with MuseScore
            musicxml_path = self.export_musicxml(score, filename.replace('.pdf', '.musicxml'))
            return self._convert_musicxml_to_pdf(musicxml_path, filepath)
        else:
            # Use music21's built-in PDF export (uses Lilypond)
            score.write('musicxml.pdf', fp=filepath)
            return filepath

    def _convert_musicxml_to_pdf(self, musicxml_path: str, pdf_path: str) -> str:
        """Convert MusicXML to PDF using MuseScore"""

        # Try to find MuseScore executable
        musescore_path = self._find_musescore()

        if musescore_path:
            try:
                subprocess.run([
                    musescore_path,
                    musicxml_path,
                    '-o', pdf_path
                ], check=True, capture_output=True)
                return pdf_path
            except Exception as e:
                print(f"Error converting with MuseScore: {e}")

        # Fallback: use music21's PDF export
        try:
            s = music21.converter.parse(musicxml_path)
            s.write('musicxml.pdf', fp=pdf_path)
            return pdf_path
        except Exception as e:
            print(f"Error converting PDF: {e}")
            return musicxml_path

    def _find_musescore(self) -> Optional[str]:
        """Find MuseScore executable on the system"""
        import platform

        system = platform.system()

        if system == 'Windows':
            paths = [
                'C:\\Program Files\\MuseScore 4\\bin\\MuseScore4.exe',
                'C:\\Program Files\\MuseScore 3\\bin\\MuseScore3.exe',
                'C:\\Program Files (x86)\\MuseScore 3\\bin\\MuseScore3.exe',
            ]
        elif system == 'Darwin':  # macOS
            paths = [
                '/Applications/MuseScore 4.app/Contents/MacOS/mscore',
                '/Applications/MuseScore 3.app/Contents/MacOS/mscore',
            ]
        else:  # Linux
            paths = [
                '/usr/bin/mscore',
                '/usr/local/bin/mscore',
                '/usr/bin/musescore',
            ]

        for path in paths:
            if os.path.exists(path):
                return path

        return None

    def _get_timestamp(self) -> str:
        """Get timestamp string for unique filenames"""
        import time
        return str(int(time.time()))

    def create_score_from_arrangement(self, arrangement: Dict[str, Any]) -> str:
        """
        Convenience method: create score and export as MusicXML

        Args:
            arrangement: Musical arrangement dictionary

        Returns:
            Path to created MusicXML file
        """
        score = self.create_score(arrangement)
        return self.export_musicxml(score)


def create_score(arrangement: Dict[str, Any]) -> str:
    """
    Convenience function to create score from arrangement

    Args:
        arrangement: Musical arrangement dictionary

    Returns:
        Path to created MusicXML file
    """
    integration = MuseScoreIntegration()
    return integration.create_score_from_arrangement(arrangement)


def export_pdf(arrangement: Dict[str, Any]) -> str:
    """
    Convenience function to export arrangement as PDF

    Args:
        arrangement: Musical arrangement dictionary

    Returns:
        Path to created PDF file
    """
    integration = MuseScoreIntegration()
    score = integration.create_score(arrangement)
    return integration.export_pdf(score)


if __name__ == '__main__':
    # Test with sample arrangement
    sample_arrangement = {
        'style': 'bossa_nova',
        'tempo': 120,
        'timeSignature': '4/4',
        'key': 'C',
        'instruments': [
            {'name': 'Piano', 'midiChannel': 0, 'role': 'harmony'},
            {'name': 'Acoustic Guitar', 'midiChannel': 1, 'role': 'harmony'},
            {'name': 'Upright Bass', 'midiChannel': 2, 'role': 'bass'},
        ],
        'harmony': {
            'chords': [
                {'chord': 'C', 'start_beat': 0, 'duration_beats': 4},
                {'chord': 'Am', 'start_beat': 4, 'duration_beats': 4},
                {'chord': 'F', 'start_beat': 8, 'duration_beats': 4},
                {'chord': 'G', 'start_beat': 12, 'duration_beats': 4},
            ]
        }
    }

    integration = MuseScoreIntegration()
    score = integration.create_score(sample_arrangement)
    musicxml_path = integration.export_musicxml(score)
    print(f"Created MusicXML: {musicxml_path}")

    pdf_path = integration.export_pdf(score)
    print(f"Created PDF: {pdf_path}")
