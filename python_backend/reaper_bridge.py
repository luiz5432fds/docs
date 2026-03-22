"""
Maestro IA - Reaper Bridge Module
Communicates with Reaper DAW via ReaScript or OSC
"""

import subprocess
import json
import os
from typing import Dict, List, Any, Optional
import platform


class ReaperBridge:
    """Bridge to control Reaper DAW remotely"""

    def __init__(self, reaper_path: Optional[str] = None):
        """
        Initialize Reaper bridge

        Args:
            reaper_path: Path to Reaper executable (if not in PATH)
        """
        self.reaper_path = reaper_path or self._find_reaper()
        self.script_path = os.path.join(
            os.path.dirname(__file__),
            '..', 'reaper_scripts'
        )

    def _find_reaper(self) -> Optional[str]:
        """Find Reaper executable on the system"""
        system = platform.system()

        if system == 'Windows':
            paths = [
                'C:\\Program Files\\REAPER\\reaper.exe',
                'C:\\Program Files (x86)\\REAPER\\reaper.exe'
            ]
        elif system == 'Darwin':  # macOS
            paths = [
                '/Applications/REAPER.app/Contents/MacOS/REAPER'
            ]
        else:  # Linux
            paths = [
                '/usr/bin/reaper',
                '/usr/local/bin/reaper'
            ]

        for path in paths:
            if os.path.exists(path):
                return path

        return None

    def create_project(self, arrangement: Dict[str, Any]) -> str:
        """
        Create a new Reaper project from arrangement

        Args:
            arrangement: Musical arrangement dictionary

        Returns:
            Path to created .rpp file
        """
        project_name = f"maestro_{arrangement.get('style', 'unknown')}_{self._get_timestamp()}.rpp"
        rpp_path = os.path.join(self._get_output_dir(), project_name)

        # Generate RPP content
        rpp_content = self._generate_rpp_content(arrangement)

        # Write to file
        with open(rpp_path, 'w', encoding='utf-8') as f:
            f.write(rpp_content)

        return rpp_path

    def _generate_rpp_content(self, arrangement: Dict[str, Any]) -> str:
        """Generate Reaper Project file content"""

        tempo = arrangement.get('tempo', 120)
        time_sig = arrangement.get('timeSignature', '4/4')
        key = arrangement.get('key', 'C')
        instruments = arrangement.get('instruments', [])

        rpp = []
        rpp.append('<REAPER_PROJECT>')
        rpp.append(f'  <PROJECT {self._escape_attr(project_name)}>'.format(
            project_name=f"Maestro {arrangement.get('style', 'Project')}"
        ))

        # Project settings
        rpp.append(f'  <TEMPO {tempo} 1 4>')
        rpp.append(f'  <TIME_SIGNATURE {time_sig.split("/")[0]} {time_sig.split("/")[1]} 4>')
        rpp.append(f'  <PROJECT_KEY {self._key_to_reaper(key)}>')

        # Create tracks for each instrument
        for i, inst in enumerate(instruments):
            rpp.extend(self._generate_track(inst, i))

        rpp.append('</REAPER_PROJECT>')

        return '\n'.join(rpp)

    def _generate_track(self, instrument: Dict[str, Any], index: int) -> List[str]:
        """Generate track section for RPP file"""

        name = instrument.get('name', f'Track {index + 1}')
        midi_channel = instrument.get('midiChannel', 0)
        role = instrument.get('role', '')

        track = []
        track.append('  <TRACK>')
        track.append(f'    <NAME {self._escape_attr(name)}>')

        # Track height based on role
        height = self._get_track_height(role)
        track.append(f'    <TRACK_HEIGHT {height}>')

        # Volume (default to 0dB)
        track.append(f'    <VOL 1.0 1.0 -1.0 -1>')
        track.append('    <VOLEXPFUNC linear>')

        # Pan (center)
        track.append('    <PAN 0.0 0.0 1.0 -1>')
        track.append('    <PANEXPFUNC linear>')

        # MIDI settings
        track.append('    <MIDI_OUT>')
        track.append(f'      <MIDIOUTCHANNEL {midi_channel}>')

        # Set MIDI instrument based on instrument name
        program = self._get_midi_program(instrument.get('name', ''))
        if program is not None:
            track.append(f'      <MIDIOUTPROG {program} 0>')

        track.append('    </MIDI_OUT>')

        # Track color based on role
        color = self._get_track_color(role)
        track.append(f'    <TRACKCOLOR {color}>')

        track.append('  </TRACK>')

        return track

    def _get_track_height(self, role: str) -> int:
        """Get track height based on role"""
        heights = {
            'melody': 80,
            'harmony': 70,
            'bass': 60,
            'drums': 90,
            'percussion': 50,
            'pad': 60,
        }
        return heights.get(role, 60)

    def _get_track_color(self, role: str) -> str:
        """Get track color in RGB format"""
        colors = {
            'melody': '255 200 0',
            'harmony': '0 200 255',
            'bass': '255 0 100',
            'drums': '100 255 100',
            'percussion': '200 100 255',
            'pad': '150 150 200',
        }
        return colors.get(role, '180 180 180')

    def _get_midi_program(self, name: str) -> Optional[int]:
        """Get MIDI program number for instrument name"""
        programs = {
            'piano': 0,
            'acoustic piano': 0,
            'grand piano': 0,
            'electric piano': 4,
            'organ': 16,
            'guitar': 24,
            'acoustic guitar': 24,
            'electric guitar': 27,
            'bass': 32,
            'electric bass': 33,
            'strings': 48,
            'ensemble': 48,
            'strings ensemble': 48,
            'trumpet': 56,
            'trombone': 57,
            'sax': 66,
            'tenor sax': 66,
            'flute': 73,
            'clarinet': 71,
            'synth': 80,
            'synth lead': 80,
            'synth pad': 88,
        }

        name_lower = name.lower()
        for key, value in programs.items():
            if key in name_lower:
                return value

        return None

    def _key_to_reaper(self, key: str) -> int:
        """Convert music key to Reaper key format"""
        key_map = {
            'C': 0, 'Db': 1, 'D': 2, 'Eb': 3, 'E': 4,
            'F': 5, 'F#': 6, 'G': 7, 'Ab': 8, 'A': 9,
            'Bb': 10, 'B': 11,
        }
        return key_map.get(key, 0)

    def _escape_attr(self, value: str) -> str:
        """Escape attribute value for RPP format"""
        return value.replace('"', '\\"')

    def _get_output_dir(self) -> str:
        """Get output directory for projects"""
        output_dir = os.path.join(os.path.dirname(__file__), '..', 'output', 'reaper')
        os.makedirs(output_dir, exist_ok=True)
        return output_dir

    def _get_timestamp(self) -> str:
        """Get timestamp string for unique filenames"""
        import time
        return str(int(time.time()))

    def export_midi(self, arrangement: Dict[str, Any]) -> str:
        """
        Export arrangement as MIDI file

        Args:
            arrangement: Musical arrangement dictionary

        Returns:
            Path to created .mid file
        """
        import midi

        midi_name = f"maestro_{arrangement.get('style', 'unknown')}_{self._get_timestamp()}.mid"
        midi_path = os.path.join(self._get_output_dir(), midi_name)

        # Create MIDI file
        midifile = midi.MIDIFile(len(arrangement.get('instruments', [])))

        # Add tempo and time signature
        tempo = arrangement.get('tempo', 120)
        time_sig = arrangement.get('timeSignature', '4/4')
        midifile.addTempo(0, 0, tempo)

        # Add tracks for each instrument
        for i, inst in enumerate(arrangement.get('instruments', [])):
            channel = inst.get('midiChannel', i)
            midifile.addTrackName(i, 0, inst.get('name', f'Track {i}'))

            # Add some placeholder notes
            # In production, these would come from the arrangement's notes
            midifile.addNote(i, channel, 60, 0, 1, 100)

        # Write to file
        with open(midi_path, 'wb') as f:
            midifile.writeFile(f)

        return midi_path

    def open_project(self, rpp_path: str) -> bool:
        """
        Open project in Reaper

        Args:
            rpp_path: Path to .rpp file

        Returns:
            True if successful
        """
        if not self.reaper_path:
            print("Reaper executable not found")
            return False

        try:
            subprocess.Popen([self.reaper_path, rpp_path])
            return True
        except Exception as e:
            print(f"Error opening Reaper: {e}")
            return False

    def execute_script(self, script_name: str, args: List[Any]) -> Any:
        """
        Execute ReaScript with given arguments

        Args:
            script_name: Name of the script file
            args: Arguments to pass to script

        Returns:
            Script result
        """
        script_path = os.path.join(self.script_path, script_name)

        if not os.path.exists(script_path):
            print(f"Script not found: {script_path}")
            return None

        # This would need a proper ReaScript execution method
        # For now, return placeholder
        return None


def create_reaper_project(arrangement: Dict[str, Any]) -> str:
    """
    Convenience function to create Reaper project

    Args:
        arrangement: Musical arrangement dictionary

    Returns:
        Path to created .rpp file
    """
    bridge = ReaperBridge()
    return bridge.create_project(arrangement)


def export_midi(arrangement: Dict[str, Any]) -> str:
    """
    Convenience function to export MIDI

    Args:
        arrangement: Musical arrangement dictionary

    Returns:
        Path to created .mid file
    """
    bridge = ReaperBridge()
    return bridge.export_midi(arrangement)


if __name__ == '__main__':
    # Test with sample arrangement
    sample_arrangement = {
        'style': 'bossa_nova',
        'tempo': 120,
        'timeSignature': '4/4',
        'key': 'C',
        'instruments': [
            {'name': 'Piano', 'midiChannel': 0, 'role': 'harmony'},
            {'name': 'Bass', 'midiChannel': 2, 'role': 'bass'},
            {'name': 'Drums', 'midiChannel': 9, 'role': 'drums'},
        ]
    }

    bridge = ReaperBridge()
    rpp_path = bridge.create_project(sample_arrangement)
    print(f"Created project: {rpp_path}")
