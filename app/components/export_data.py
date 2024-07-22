from PyQt5.QtWidgets import QMessageBox
import glob
import os
import requests
import mysql.connector
from mysql.connector import Error
from infos.userInfo import restaurantId, lengthContent, lengthID
from infos.exportValue import AbList, HooftNameValue
from infos.mysqlInfo import *

def create_export_data_button(window, layout):
    from PyQt5.QtWidgets import QPushButton

    btn_export = QPushButton('Export Data', window)
    btn_export.clicked.connect(lambda: export_data(window))
    layout.addWidget(btn_export)

def export_data(window):
    delete_all_ab_files(window)
    create_all_ab_files(window)
    fetch_data(window)

def delete_all_ab_files(window):
    if window.path:
        search_pattern  = os.path.join(window.path, 'ab*')
        files_to_delete = glob.glob(search_pattern, recursive=False)
        for file_path in files_to_delete:
            if os.path.isfile(file_path) and os.path.basename(file_path).lower().startswith('ab'):
                try:
                    os.remove(file_path)
                except Exception as e:
                    print(f"Error deleting {file_path}: {e}")

def create_all_ab_files(window):
    AblistCopy = list(AbList)
    for abFileName in AblistCopy:
        file_path = os.path.join(window.path, abFileName)
        with open(file_path, 'w') as file:
            pass

def create_connection(host_name, user_name, user_password, db_name):
    connection = None
    try:
        connection = mysql.connector.connect(
            host=host_name,
            port=port, 
            user=user_name,
            password=user_password,
            database=db_name,
            raise_on_warnings=True
        )
        # connection = mysql.connector.connect(
        #     host='fastorder.be.mysql:3306',
        #     # port=3306, 
        #     user='fastorder_bexudox',
        #     password='xzystar0800#',
        #     database='fastorder_bexudox',
        #     raise_on_warnings=True
        # )
        print("Connection to MySQL DB successful")
    except Error as e:
        print(f"The error '{e}' occurred")
    return connection

select_all_products_query = """
SELECT * FROM product WHERE rid = %s
"""
select_all_categories_query = """
SELECT * FROM category WHERE rid = %s
"""

def execute_fetch_query(window, connection, query, data):
    cursor = connection.cursor(dictionary=True)
    try:
        cursor.execute(query, data)
        result = cursor.fetchall()
        return result
    except Error as e:
        print(f"The error '{e}' occurred in fetching all product")
        QMessageBox.critical(window, 'Error', f'Failed to fetch data')
        return None

def fetch_data(window):
    connection = create_connection(host_name, user_name, user_password, db_name)
    if not connection:
        return

    products = execute_fetch_query(window, connection, select_all_products_query, (restaurantId,))
    if not products:
        return
    else:
        if window.path:
            init_file(window, 'zwcd.txt')
            init_file(window, 'HooftName.txt')
            AblistCopy = list(AbList)
            for product in products:
                abData = format_product_data(product)
                Xu_class = product.get('Xu_class', 'unknown')
                if Xu_class not in AblistCopy:
                    AblistCopy.append(Xu_class)
                    init_file(window, Xu_class)

                file_path = os.path.join(window.path, Xu_class)
                with open(file_path, 'a', encoding='utf-8') as file:
                    file.write(abData + '\n')

                kitchenData = format_kitchen_data(product)
                kitchen_file_path = os.path.join(window.path, 'zwcd.txt')
                with open(kitchen_file_path, 'a', encoding='utf-8') as file:
                    file.write(kitchenData + '\n')

            HooftValue = format_hooft_name(window, connection)
            HooftName_file_path = os.path.join(window.path, 'HooftName.txt')
            with open(HooftName_file_path, 'a', encoding='utf-8') as file:
                    file.write(HooftValue)

            QMessageBox.information(window, 'Success', 'Data saved successfully!')
        else:
            QMessageBox.warning(window, 'Cancelled', 'Save operation was cancelled.')

    # except requests.exceptions.RequestException as e:
    #     QMessageBox.critical(window, 'Error', f'Failed to fetch data: {e}')

def init_file(window, fileName):
    file_path = os.path.join(window.path, fileName)
    if os.path.exists(file_path):
        os.remove(file_path)
    with open(file_path, 'w') as file:
        pass

def format_product_data(product):
    id_Xu_recv = product.get('id_Xu', 'noID')
    id_Xu = '---' if id_Xu_recv == 'hyphen3' else id_Xu_recv.rjust(lengthID, ' ')
    bill_content_recv = product.get('bill_content', 'noBillContent')
    bill_content = bill_content_recv + '.'.ljust(lengthContent - len(bill_content_recv), ' ')
    price = product.get('price', 'noPrice')
    return f'{id_Xu} {bill_content} {price}'

def format_kitchen_data(product):
    id_Xu_recv = str(product.get('id_Xu', ''))
    id_Xu = ''
    if id_Xu_recv=='hyphen3':
        id_Xu = '---'
    else:
        id_Xu = id_Xu_recv.rjust(lengthID, ' ')
    kitchen_content = product.get('kitchen_content', '')
    return f"{id_Xu} {kitchen_content}"

def format_hooft_name(window, connection):

    categories = execute_fetch_query(window, connection, select_all_categories_query, (restaurantId,))

    HooftNameValueCopy = dict(HooftNameValue)
    for category in categories:
        if category.get('Xu_class') != 'met.txt':
            name = category.get('name') or category.get('ename') or category.get('lname') or category.get('fname') or category.get('zname')
            if category.get('Xu_class') not in HooftNameValueCopy:
                HooftNameValueCopy[category.get('Xu_class')] = ''
            HooftNameValueCopy[category.get('Xu_class')] += ' ' + name
    for key, value in HooftNameValueCopy.items():
        if not value.strip():
            HooftNameValueCopy[key] += ' void'

    valueHooft = 'Contents\n'
    for key, value in HooftNameValueCopy.items():
        valueHooft += f"{key}{value}\n"

    return valueHooft
