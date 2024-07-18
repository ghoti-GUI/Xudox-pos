import requests
import os
# import csv
import mysql.connector
from mysql.connector import Error
from PyQt5.QtWidgets import QMessageBox, QFileDialog
from PyQt5.QtCore import QTimer
from .export_data import export_data
from infos.urls import deleteAllUrl, getCidByCategoryNameUrl, addCategoryUrl, addProductUrl,addAllProductsAppUrl, getTokenUrl
# from infos.userInfo import restaurantId, lengthContent, load_selected_path
from infos.userInfo import restaurantId, lengthContent, save_import_path, load_import_path
from infos.models import productModel, categoryModel
from infos.mysqlInfo import *


def create_connection(host_name, user_name, user_password, db_name):
    connection = None
    try:
        connection = mysql.connector.connect(
            host=host_name,
            user=user_name,
            passwd=user_password,
            database=db_name
        )
        print("Connection to MySQL DB successful")
    except Error as e:
        print(f"The error '{e}' occurred")
    return connection

def close_connection(connection):
    if connection.is_connected():
        connection.close()
        print("The connection is closed")

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

def execute_query(connection, query, data):
    cursor = connection.cursor()
    try:
        cursor.execute(query, data)
        connection.commit()
        # print("Query executed successfully")
    except Error as e:
        print(f"The error '{e}' occurred in execute")
        return e

def execute_fetch_query(connection, query, data):
    cursor = connection.cursor()
    try:
        cursor.execute(query, data)
        result = cursor.fetchone()
        return result
    except Error as e:
        print(f"The error '{e}' occurred in fetch")
        return None
        
def execute_many_query(connection, query, data):
    cursor = connection.cursor()
    try:
        cursor.executemany(query, data)
        connection.commit()
        print("Query executed successfully")
    except Error as e:
        print(f"The error '{e}' occurred in execute many")
        return e

insert_product_query = """
INSERT INTO product (id_Xu, bill_content, kitchen_content, price, price2, Xu_class, cid, rid)
VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
"""
insert_category_query = """
INSERT INTO category (name, Xu_class, rid)
VALUES (%s, %s, %s)
"""
select_category_query = """
SELECT id FROM category WHERE name = %s AND rid = %s
"""
last_insert_id_query = "SELECT LAST_INSERT_ID()"

def import_data(window, file):
    connection = create_connection(host_name, user_name, user_password, db_name)
    
    product_data = []

    e = delete_all_data(connection, restaurantId)
    if e:
        QMessageBox.warning(window, "Delete Failed", f"Delete old data failed:\n\n{e}")
        return

    with open(file, 'r', encoding='gbk') as csvfile:

        failed = []
        id_list = []

        for line in csvfile.readlines():
            line = line.strip().split(';') # 使用strip()去掉行尾的换行符

            if len(line) < 5:
                continue
            id, name, price, Xu_class, category_name = line[:5]

            category_id = get_or_create_category_id(connection, category_name, Xu_class, restaurantId)
            if not category_id:
                failed.append(f"{line} --- category create failed")
                continue


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


            # print(id, bill_content, bill_content, price, price, Xu_class, category_id, restaurantId)
            product_data.append(
                (id, bill_content, bill_content, price, price, Xu_class, category_id, restaurantId)
            )

        e = execute_many_query(connection, insert_product_query, product_data)
        if e:
            failed.append(f"--- product add failed\n\n{e}")

        if failed:
            QMessageBox.warning(window, "Import Results", f"Some imports failed:\n\n" + "\n".join(failed))
        else:
            QTimer.singleShot(0, lambda: QMessageBox.information(window, "Import Results", "All imports succeeded"))

    # close_connection(connection)
    export_data(window)




def delete_all_data(connection, restaurantId):
    delete_product_query = """
    DELETE FROM product WHERE rid = %s
    """
    delete_category_query = """
    DELETE FROM category WHERE rid = %s
    """

    e_product = execute_query(connection, delete_product_query, (restaurantId,))
    print('e_product', e_product)
    if e_product:
        return e_product

    e_category = execute_query(connection, delete_category_query, (restaurantId,))
    print('e_category', e_category)
    return e_category

    # try:
    #     response = requests.post(deleteAllUrl, data={'rid':restaurantId})
    #     response.raise_for_status()  # 如果响应状态码不是200-399，抛出HTTPError
    #     print('delete succeed')
    #     return True
    # except requests.RequestException as error:
    #     print('Error delete all:', error)
    #     QMessageBox.warning(window, "Delete data failed", f"Error delete all: {error}")
    #     return False


def get_or_create_category_id(connection, category_name, Xu_class, restaurantId):
    category_data = (category_name, Xu_class, restaurantId)

    id = execute_fetch_query(connection, select_category_query, (category_name, restaurantId))

    if not id:
        if execute_query(connection, insert_category_query, category_data):
            return None
        return execute_fetch_query(connection, last_insert_id_query, ())[0]
    return id[0]

    # try:
    #     response = requests.get(getCidByCategoryNameUrl, params={'category_name': category_name})
    #     response.raise_for_status()
    #     return response.json().get('cid')
    # except requests.RequestException:
    #     category_data = dict(categoryModel)
    #     category_data['name'] = category_name
    #     category_data['Xu_class'] = Xu_class
    #     category_data['rid'] = restaurantId
    #     return add_category(window, category_data)


# def add_category(window, category_data):
#     try:
#         response = requests.post(addCategoryUrl, data=category_data)
#         response.raise_for_status()
#         return response.json().get('id')
#     except requests.RequestException:
#         return None
    

# def add_product(window, product_data):
#     try:
#         response = requests.post(addProductUrl, data=product_data)
#         response.raise_for_status()
#         return True
#     except requests.RequestException:
#         return False


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


# def get_csrf_token():
#     try:
#         response = requests.get(getTokenUrl)
#         response.raise_for_status()
#         token = response.json().get('token')
#         return token
#     except requests.RequestException as error:
#         print('Error fetching CSRF token:', error)
#         return None

# def sendAllProductData(allProductData):
#     try:
#         csrf_token = get_csrf_token()
#         print(csrf_token)
#         headers = {
#             'X-CSRFToken': csrf_token,
#             'Content-Type': 'application/json'
#         }
#         response = requests.post(addAllProductsAppUrl, json=allProductData, headers=headers)
#         response.raise_for_status()
#         return True
#     except requests.RequestException:
#         return False