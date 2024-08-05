from PyQt5.QtWidgets import QMessageBox
import glob
import os
import re
import requests
import mysql.connector
from mysql.connector import Error
from infos.userInfo import restaurantId, country
from infos.exportImportValue import AbList, HooftNameValue, lengthContent, lengthID, encode_type
from infos.mysqlInfo import *
from .utils import create_conn_tunnel, create_connection

def create_export_data_button(app, layout):
    from PyQt5.QtWidgets import QPushButton

    # Create a button to bind to the export function.
    btn_export = QPushButton('Export Data', app)
    btn_export.clicked.connect(lambda: export_data(app))
    layout.addWidget(btn_export)

def export_data(app):
    if not os.path.exists(app.path):
        print(f"The path {app.path} does not exist. Stopping execution.")
        QMessageBox.critical(app, 'Error', f"The path {app.path} does not exist. Please change another directory.")
        return
    if not os.path.isdir(app.path):
        print(f"The path {app.path} is not a directory. Stopping execution.")
        QMessageBox.critical(app, 'Error', f"The path {app.path} is not a directory. Please change a directory.")
        return
    delete_all_ab_files(app)
    create_all_ab_files(app)
    fetch_data(app)

def delete_all_ab_files(app):
    if app.path:
        # Search for files that begin with 'ab', ignore case, are followed by a number, and end with .txt, 
        # Then delete them
        search_pattern  = os.path.join(app.path, 'ab*')
        files_to_delete = glob.glob(search_pattern, recursive=False)
        pattern = re.compile(r'^ab\d+\.txt$', re.IGNORECASE)
        for file_path in files_to_delete:
            # print(file_path)
            # 判断路径是否是个文件，获取路径中的文件名并判断是否匹配pattern
            if os.path.isfile(file_path) and pattern.match(os.path.basename(file_path).lower()):
                try:
                    os.remove(file_path)
                except Exception as e:
                    print(f"Error deleting {file_path}: {e}")

def create_all_ab_files(app):
    AblistCopy = list(AbList)
    for abFileName in AblistCopy:
        file_path = os.path.join(app.path, abFileName)
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

def execute_fetch_query(app, connection, query, data):
    cursor = connection.cursor(dictionary=True)
    try:
        cursor.execute(query, data)
        result = cursor.fetchall()
        return result
    except ProgrammingError as e:
        # 特定捕获表或字段不存在的错误
        print(f"The error '{e}' occurred: Table or field does not exist")
        QMessageBox.warning(window, "Table or field does not exist", f"{e}")
        return None
    except Error as e:
        print(f"The error '{e}' occurred in fetching all product")
        QMessageBox.critical(app, 'Error', f'Failed to fetch data')
        return None

def fetch_data(app):
    # tunnel = create_conn_tunnel(ssh_host, ssh_port, ssh_username, ssh_password, host_name, mysql_port)
    # tunnel.start()
    # connection = create_connection('127.0.0.1', tunnel.local_bind_port, user_name, user_password, db_name)
    # Establishing a database connection
    connection = create_connection(host_name, mysql_port, user_name, user_password, db_name)

    if connection.is_connected():
        # Getting database data
        products = execute_fetch_query(app, connection, select_all_products_query, (restaurantId,))
        if products:
            if app.path:
                # Initialisation file
                addition_files = ['zwcd.txt', 'zwwm.txt', 'RGB.txt', 'riscd.txt', 'riswm.txt', 'HooftName.txt']
                for file in addition_files:
                    init_file(app, file)
                # Initialising data written to 'ad.txt'
                AblistCopy = list(AbList)

                for product in products:
                    # Get the 'category' corresponding to 'tva_id'
                    tva_id = product.get('TVA_id')
                    tva_category_sql = execute_fetch_query(app, connection, select_tva_query, (tva_id,))[0].get('category')
                    # Integration into lines in 'ab.txt'
                    abData = format_product_data(product, tva_category_sql)

                    # Add 'non-ab.txt' files not written in 'Xu_class', e.g. 'hoofd.txt'
                    Xu_class = product.get('Xu_class', 'unknown')
                    if Xu_class not in AblistCopy:
                        AblistCopy.append(Xu_class)
                        init_file(app, Xu_class)
                    # Add to 'ab' file
                    file_path = os.path.join(app.path, Xu_class)
                    with open(file_path, 'a', encoding=encode_type) as file:
                        file.write(abData + '\n')

                    # Write zwcd.txt, zwwm.txt, riscd.txt, riswm.txt
                    zwcd_data = format_zname_data(product)
                    riscd_data = format_print_data(product)
                    dinein_takeaway = product.get('dinein_takeaway')
                    if dinein_takeaway == 1:
                        zwcd_file_path = os.path.join(app.path, 'zwcd.txt')
                        with open(zwcd_file_path, 'a', encoding=encode_type) as file:
                            file.write(zwcd_data)
                        riscd_file_path = os.path.join(app.path, 'riscd.txt')
                        with open(riscd_file_path, 'a', encoding=encode_type) as file:
                            file.write(riscd_data + '\n')
                    elif dinein_takeaway == 2:
                        zwcd_file_path = os.path.join(app.path, 'zwwm.txt')
                        with open(zwcd_file_path, 'a', encoding=encode_type) as file:
                            file.write(zwcd_data)
                        riscd_file_path = os.path.join(app.path, 'riswm.txt')
                        with open(riscd_file_path, 'a', encoding=encode_type) as file:
                            file.write(riscd_data + '\n')

                    # Write RGB.txt
                    color_text = format_rgb_data(product)
                    zwcd_file_path = os.path.join(app.path, 'RGB.txt')
                    with open(zwcd_file_path, 'a', encoding=encode_type) as file:
                        file.write(color_text + '\n')

                # Write HooftName.txt
                HooftValue = format_hooft_name(app, connection)
                HooftName_file_path = os.path.join(app.path, 'HooftName.txt')
                with open(HooftName_file_path, 'a', encoding=encode_type) as file:
                    file.write(HooftValue)

                # Delete files other than 'ad.txt' that are empty.
                for file in addition_files:
                    file_path = os.path.join(app.path, file)
                    if os.path.getsize(file_path) == 0:
                        os.remove(file_path)

                QMessageBox.information(app, 'Success', 'Data saved successfully!')
            else:
                QMessageBox.warning(app, 'Cancelled', 'Save operation was cancelled.')
        else:
            QMessageBox.information(app, 'Empty Database', 'There\'s no product data.')

    # tunnel.stop()
    # except requests.exceptions.RequestException as e:
    #     QMessageBox.critical(app, 'Error', f'Failed to fetch data: {e}')

# Initialisation files (delete + new)
def init_file(app, fileName):
    file_path = os.path.join(app.path, fileName)
    if os.path.exists(file_path):
        os.remove(file_path)
    with open(file_path, 'w') as file:
        pass

# Return consolidated rows to 'ab.txt'
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
    elif tva_category_sql == 4:
        tva_category = 'D'
    else:
        tva_category = None

    return f'{id_Xu} {bill_content} {price} {tva_category}'

# Return consolidated rows to 'zwcd.txt' and 'zwcd.txt'
def format_zname_data(product):
    id_Xu_recv = product.get('id_Xu', '')
    id_Xu = '---' if id_Xu_recv == 'hyphen3' else id_Xu_recv.rjust(lengthID, ' ')
    kitchen_content = product.get('kitchen_content', '')
    if kitchen_content:
        return f"{id_Xu} {kitchen_content}\n"
    else:
        return ''

# Return consolidated rows to 'RGB.txt'
def format_rgb_data(product):
    id_Xu_recv = product.get('id_Xu', '')
    id_Xu = '---' if id_Xu_recv == 'hyphen3' else id_Xu_recv.rjust(lengthID, ' ')
    rgb_data = product.get('color', '')
    rgb_ls = re.findall(r'\d+', rgb_data)
    rgb_text = ' '.join(rgb_ls)
    return f"{id_Xu} {rgb_text.rjust(3, ' ')}"

# Return consolidated rows to 'printer.txt'
def format_print_data(product):
    printer = product.get('print_to_where', '')
    kitchen_content = product.get('kitchen_content', '')
    return f"{printer} {kitchen_content}"


# Returns all integrated data to HooftName.txt
def format_hooft_name(app, connection):
    categories = execute_fetch_query(app, connection, select_all_categories_query, (restaurantId,))
    HooftNameValueCopy = dict(HooftNameValue)
    for category in categories:
        if category.get('Xu_class') != 'met.txt':
            name = category.get('name') or category.get('ename') or category.get('lname') or category.get('fname') or category.get('zname')
            if category.get('Xu_class') not in HooftNameValueCopy:
                HooftNameValueCopy[category.get('Xu_class')] = ''
            if HooftNameValueCopy[category.get('Xu_class')] == '':
                HooftNameValueCopy[category.get('Xu_class')] += ' ' + name
    for key, value in HooftNameValueCopy.items():
        if not value.strip():
            HooftNameValueCopy[key] += ' void'

    valueHooft = ''
    for key, value in HooftNameValueCopy.items():
        valueHooft += f"{key}{value}\n"

    return valueHooft
