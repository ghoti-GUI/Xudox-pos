from PyQt5.QtWidgets import QMessageBox
import glob
import os
import re
import requests
import mysql.connector
from mysql.connector import Error
import sshtunnel
from infos.userInfo import restaurantId, lengthContent, lengthID, country
from infos.exportValue import AbList, HooftNameValue
from infos.mysqlInfo import *
from .utils import create_conn_tunnel, create_connection

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


select_all_products_query = """
SELECT * FROM product WHERE rid = %s
"""
select_all_categories_query = """
SELECT * FROM category WHERE rid = %s
"""
select_tva_query = """
SELECT * FROM tva WHERE id = %s
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
    # tunnel = create_conn_tunnel(ssh_host, ssh_port, ssh_username, ssh_password, host_name, mysql_port)
    # tunnel.start()
    # connection = create_connection('127.0.0.1', tunnel.local_bind_port, user_name, user_password, db_name)
    connection = create_connection(host_name, mysql_port, user_name, user_password, db_name)

    if connection.is_connected():
        products = execute_fetch_query(window, connection, select_all_products_query, (restaurantId,))
        # tva = execute_fetch_query(window, connection, select_tva_query, (country,))
        if products:
            if window.path:
                addition_files = ['zwcd.txt', 'zwwm.txt', 'RGB.txt', 'riscd.txt', 'riswm.txt', 'HooftName.txt']
                for file in addition_files:
                    init_file(window, file)
                AblistCopy = list(AbList)
                for product in products:
                    tva_id = product.get('TVA_id')
                    tva_category_sql = execute_fetch_query(window, connection, select_tva_query, (tva_id,))[0].get('category')
                    abData = format_product_data(product, tva_category_sql)
                    Xu_class = product.get('Xu_class', 'unknown')
                    if Xu_class not in AblistCopy:
                        AblistCopy.append(Xu_class)
                        init_file(window, Xu_class)

                    file_path = os.path.join(window.path, Xu_class)
                    with open(file_path, 'a', encoding='utf-8') as file:
                        file.write(abData + '\n')

                    zwcd_data = format_zname_data(product)
                    riscd_data = format_print_data(product)
                    dinein_takeaway = product.get('dinein_takeaway')
                    if dinein_takeaway == 1:
                        zwcd_file_path = os.path.join(window.path, 'zwcd.txt')
                        with open(zwcd_file_path, 'a', encoding='utf-8') as file:
                            file.write(zwcd_data + '\n')
                        riscd_file_path = os.path.join(window.path, 'riscd.txt')
                        with open(riscd_file_path, 'a', encoding='utf-8') as file:
                            file.write(riscd_data + '\n')
                    # elif dinein_takeaway == 3:
                    #     zwcd_file_path = os.path.join(window.path, 'zwcd.txt')
                    #     with open(zwcd_file_path, 'a', encoding='utf-8') as file:
                    #         file.write(zwcd_data + '\n')
                    #     zwcd_file_path = os.path.join(window.path, 'zwwm.txt')
                    #     with open(zwcd_file_path, 'a', encoding='utf-8') as file:
                    #         file.write(zwcd_data + '\n')
                    #     riscd_file_path = os.path.join(window.path, 'riscd.txt')
                    #     with open(riscd_file_path, 'a', encoding='utf-8') as file:
                    #         file.write(riscd_data + '\n')
                    #     riscd_file_path = os.path.join(window.path, 'riswm.txt')
                    #     with open(riscd_file_path, 'a', encoding='utf-8') as file:
                    #         file.write(riscd_data + '\n')
                    elif dinein_takeaway == 2:
                        zwcd_file_path = os.path.join(window.path, 'zwwm.txt')
                        with open(zwcd_file_path, 'a', encoding='utf-8') as file:
                            file.write(zwcd_data + '\n')
                        riscd_file_path = os.path.join(window.path, 'riswm.txt')
                        with open(riscd_file_path, 'a', encoding='utf-8') as file:
                            file.write(riscd_data + '\n')

                    color_text = format_rgb_data(product)
                    zwcd_file_path = os.path.join(window.path, 'RGB.txt')
                    with open(zwcd_file_path, 'a', encoding='utf-8') as file:
                        file.write(color_text + '\n')

                HooftValue = format_hooft_name(window, connection)
                HooftName_file_path = os.path.join(window.path, 'HooftName.txt')
                with open(HooftName_file_path, 'a', encoding='utf-8') as file:
                        file.write(HooftValue)

                for file in addition_files:
                    file_path = os.path.join(window.path, file)
                    if os.path.getsize(file_path) == 0:
                        os.remove(file_path)

                QMessageBox.information(window, 'Success', 'Data saved successfully!')
            else:
                QMessageBox.warning(window, 'Cancelled', 'Save operation was cancelled.')
        else:
            QMessageBox.information(window, 'Empty Database', 'There\'s no product data.')

    # tunnel.stop()
    # except requests.exceptions.RequestException as e:
    #     QMessageBox.critical(window, 'Error', f'Failed to fetch data: {e}')

def init_file(window, fileName):
    file_path = os.path.join(window.path, fileName)
    if os.path.exists(file_path):
        os.remove(file_path)
    with open(file_path, 'w') as file:
        pass

def format_product_data(product, tva_category_sql):
    id_Xu_recv = product.get('id_Xu', 'noID')
    id_Xu = '---' if id_Xu_recv == 'hyphen3' else id_Xu_recv.rjust(lengthID, ' ')
    bill_content_recv = product.get('bill_content', 'noBillContent')
    bill_content = bill_content_recv + '.'.ljust(lengthContent - len(bill_content_recv), ' ')
    price = str(product.get('price', '0.00'))

    if tva_category_sql == 1:
        tva_category = 'A'
    elif tva_category_sql == 2:
        tva_category = 'B'
    elif tva_category_sql == 3:
        tva_category = 'C'
    else:
        tva_category = None

    return f'{id_Xu} {bill_content} {price} {tva_category}'


def format_zname_data(product):
    id_Xu_recv = product.get('id_Xu', '')
    id_Xu = '---' if id_Xu_recv == 'hyphen3' else id_Xu_recv.rjust(lengthID, ' ')
    zname = product.get('zname', '')
    return f"{id_Xu} {zname}"

def format_rgb_data(product):
    id_Xu_recv = product.get('id_Xu', '')
    id_Xu = '---' if id_Xu_recv == 'hyphen3' else id_Xu_recv.rjust(lengthID, ' ')
    rgb_data = product.get('color', '')
    rgb_ls = re.findall(r'\d+', rgb_data)
    rgb_text = ' '.join(rgb_ls)
    return f"{id_Xu} {rgb_text.rjust(3, ' ')}"

def format_print_data(product):
    printer = product.get('print_to_where', '')
    zname = product.get('zname', '')
    return f"{printer} {zname}"



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
