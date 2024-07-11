import os
from PyQt5.QtWidgets import QFileDialog, QLabel
# from infos.userInfo import save_selected_path
from infos.userInfo import save_export_path, load_export_path

def create_select_folder_button(window, layout):
    from PyQt5.QtWidgets import QPushButton

    label = QLabel(f'Selected Folder: \n{os.path.abspath(window.path)}', window)
    layout.addWidget(label)

    btn_select_folder = QPushButton('Change Folder', window)
    btn_select_folder.clicked.connect(lambda: select_folder(window, label))
    layout.addWidget(btn_select_folder)

def select_folder(window, label):
    folder_path = QFileDialog.getExistingDirectory(window, 'Select Export Folder', window.path)
    if folder_path:
        window.path = folder_path
        label.setText(f'Selected Folder: \n{folder_path}')
        save_export_path(folder_path)
        # save_selected_path(folder_path)
