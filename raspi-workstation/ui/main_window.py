"""Janela principal com abas para cada motor sonoro e páginas adicionais."""

from PyQt5 import QtWidgets


class MainWindow(QtWidgets.QMainWindow):
    def __init__(self) -> None:
        super().__init__()
        self.setWindowTitle("Raspberry Workstation")
        self.resize(1024, 768)

        self.tabs = QtWidgets.QTabWidget()
        self.setCentralWidget(self.tabs)

        # Abas de motores sonoros
        self.add_engine_tab("Sintetizador")
        self.add_engine_tab("Sampler")
        self.add_engine_tab("Orgão")
        self.add_engine_tab("Piano")
        self.add_engine_tab("Analógico")
        self.add_engine_tab("FM")
        self.add_engine_tab("D-50")
        self.add_engine_tab("XP-80")
        self.add_engine_tab("QuadraSynth")
        self.add_engine_tab("Korg M")
        self.add_engine_tab("DX7")
        self.add_engine_tab("Orquestral")
        self.add_engine_tab("Coral")
        self.add_engine_tab("Sanfona")
        self.add_engine_tab("Metais")
        self.add_engine_tab("Madeiras")

        # Demais páginas de configurações
        self.add_page("Efeitos")
        self.add_page("ADSR")
        self.add_page("Performance")
        self.add_page("Global")
        self.add_page("Master")
        self.add_page("Arpeggiador")

    def add_engine_tab(self, name: str) -> None:
        widget = QtWidgets.QWidget()
        layout = QtWidgets.QVBoxLayout(widget)
        label = QtWidgets.QLabel(f"Página do motor {name}")
        layout.addWidget(label)
        self.tabs.addTab(widget, name)

    def add_page(self, name: str) -> None:
        widget = QtWidgets.QWidget()
        layout = QtWidgets.QVBoxLayout(widget)
        label = QtWidgets.QLabel(f"Página de {name}")
        layout.addWidget(label)
        self.tabs.addTab(widget, name)
