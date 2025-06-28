"""Aplicativo principal para a firmware de workstation em Raspberry Pi."""

import sys
from PyQt5 import QtWidgets
import qdarkstyle

from ui.main_window import MainWindow


def main() -> None:
    app = QtWidgets.QApplication(sys.argv)
    app.setStyleSheet(qdarkstyle.load_stylesheet_pyqt5())
    window = MainWindow()
    window.show()
    sys.exit(app.exec_())


if __name__ == "__main__":
    main()
