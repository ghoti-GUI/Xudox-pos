import sys
import os
from PyQt5.QtWidgets import QApplication, QVBoxLayout, QWidget
from components.select_folder import create_select_folder_button
from components.export_data import create_export_data_button
from components.import_data import create_import_data_button
# from infos.userInfo import load_selected_path
from infos.userInfo import load_export_path

class MyApp(QWidget):
    def __init__(self):
        super().__init__()
        self.path = load_export_path()
        self.initUI()

    def initUI(self):
        layout = QVBoxLayout()

        create_select_folder_button(self, layout)
        create_export_data_button(self, layout)
        create_import_data_button(self, layout)

        self.setLayout(layout)
        self.setWindowTitle('Export/Import')
        self.setGeometry(300, 300, 300, 200)
        self.show()

if __name__ == '__main__':

    app = QApplication(sys.argv)
    ex = MyApp()
    sys.exit(app.exec_())
