import requests
import os
# import csv
from PyQt5.QtWidgets import QMessageBox, QFileDialog
from PyQt5.QtCore import QTimer
from .export_data import export_data
from infos.urls import deleteAllUrl, getCidByCategoryNameUrl, addCategoryUrl, addProductUrl
# from infos.userInfo import restaurantId, lengthContent, load_selected_path
from infos.userInfo import restaurantId, lengthContent, save_import_path, load_import_path
from infos.models import productModel, categoryModel

def create_import_data_button(window, layout):
    from PyQt5.QtWidgets import QPushButton

    btn_import = QPushButton('Import Data', window)
    btn_import.clicked.connect(lambda: handle_file_select(window))
    layout.addWidget(btn_import)


def handle_file_select(window):
    options = QFileDialog.Options()
    initial_path = load_import_path()
    file_name, _ = QFileDialog.getOpenFileName(window, "Select Import File", initial_path, "CSV Files (*.csv);;All Files (*)", options=options)
    if file_name:
        save_import_path(os.path.dirname(file_name))
        import_data(window, file_name)
        


def import_data(window, file):
    delete_all_data(window, deleteAllUrl, restaurantId)

    with open(file, 'r', encoding='gbk') as csvfile:
        failed = []
        id_list = []

        for line in csvfile.readlines():
            line = line.strip().split(';') # 使用strip()去掉行尾的换行符
            if len(line) < 5:
                continue
            id, name, price, Xu_class, category_name = line[:5]
            if id in id_list:
                failed.append(f"{line} --- ID duplicated")
                continue
            if id != '---':
                id_list.append(id)
            else:
                id = 'hyphen3'

            bill_content, exceed = truncate_string(name, lengthContent)
            if exceed:
                QMessageBox.warning(window, 'Name over the limit:', f'ID:{id}\nname:{name}')

            category_id = get_or_create_category_id(window, category_name, Xu_class)
            if category_id is None:
                failed.append(f"{line} --- category creation failed")
                continue

            product_data = dict(productModel)
            product_data['id_Xu'] = id
            product_data['bill_content'] = bill_content
            product_data['kitchen_content'] = bill_content
            product_data['TVA_country'] = 'Belgium'
            product_data['TVA_category'] = 1
            product_data['price'] = price
            product_data['price2'] = price
            product_data['Xu_class'] = Xu_class
            product_data['cid'] = category_id
            product_data['rid'] = restaurantId

            if not add_product(window, product_data):
                failed.append(f"{line} --- add failed")

        if failed:
            QMessageBox.warning(window, "Import Results", f"Some imports failed:\n\n" + "\n".join(failed))
        else:
            # QMessageBox.information(window, "Import Results", "All imports succeeded")
            QTimer.singleShot(0, lambda: QMessageBox.information(window, "Import Results", "All imports succeeded"))


    export_data(window)




def delete_all_data(window, deleteAllUrl, restaurantId):
    try:
        response = requests.post(deleteAllUrl, data={'rid':restaurantId})
        response.raise_for_status()  # 如果响应状态码不是200-399，抛出HTTPError
        print('delete succeed')
        return True
    except requests.RequestException as error:
        print('Error delete all:', error)
        QMessageBox.warning(window, "Delete data failed", f"Error delete all: {error}")
        return False


def get_or_create_category_id(window, category_name, Xu_class):
    try:
        response = requests.get(getCidByCategoryNameUrl, params={'category_name': category_name})
        response.raise_for_status()
        return response.json().get('cid')
    except requests.RequestException:
        category_data = dict(categoryModel)
        category_data['name'] = category_name
        category_data['Xu_class'] = Xu_class
        category_data['rid'] = restaurantId
        return add_category(window, category_data)


def add_category(window, category_data):
    try:
        response = requests.post(addCategoryUrl, data=category_data)
        response.raise_for_status()
        return response.json().get('id')
    except requests.RequestException:
        return None
    

def add_product(window, product_data):
    try:
        response = requests.post(addProductUrl, data=product_data)
        response.raise_for_status()
        return True
    except requests.RequestException:
        return False


def truncate_string(string, max_length):
    length = 0
    result = ''
    exceed = False

    for char in string:
        if ord(char) > 127:
            length += 2
        else:
            length += 1

        if length > max_length:
            exceed = True
            break

        result += char

    return result, exceed