import requests
import os
# import csv
import mysql.connector
from mysql.connector import Error
from PyQt5.QtWidgets import QMessageBox, QFileDialog
from PyQt5.QtCore import QTimer
from .export_data import export_data
# from infos.userInfo import restaurantId, lengthContent, load_selected_path
from infos.userInfo import restaurantId, country, lengthContent, save_import_path, load_import_path
from infos.models import productModel, categoryModel
from infos.mysqlInfo import *


def create_connection(host_name, user_name, user_password, db_name):
    connection = None
    try:
        connection = mysql.connector.connect(
            host=host_name,
            port=mysql_port, 
            user=user_name,
            passwd=user_password,
            database=db_name
        )
        print("Connection to MySQL DB successful")
    except Error as e:
        print(f"The error '{e}' occurred")
        QMessageBox.warning(window, "Connection to MySQL DB successful Failed", f"The error '{e}' occurred")
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
    cursor = connection.cursor(buffered=True)
    try:
        cursor.execute(query, data)
        connection.commit()
    except Error as e:
        print(f"The error '{e}' occurred in execute")
        return e
    finally:
        cursor.close()

def execute_fetch_query(connection, query, data):
    cursor = connection.cursor(buffered=True)
    try:
        cursor.execute(query, data)
        result = cursor.fetchall()
        return result
    except Error as e:
        print(f"The error '{e}' occurred in fetch")
        return None
    finally:
        cursor.close()
        
def execute_many_query(connection, query, data):
    cursor = connection.cursor(buffered=True)
    try:
        cursor.executemany(query, data)
        connection.commit()
    except Error as e:
        print(f"The error '{e}' occurred in execute many")
        return e
    finally:
        cursor.close()

def update_data(connection, table_name, set_clause, condition_clause, values):
    cursor = connection.cursor()
    query = f"UPDATE {table_name} SET {set_clause} WHERE {condition_clause}"
    try:
        cursor.execute(query, values)
        connection.commit()
        print("Record updated successfully")
    except Error as e:
        print(f"The error '{e}' occurred")
    finally:
        cursor.close()

insert_product_query = """
INSERT INTO product (id_Xu, bill_content, kitchen_content, zname, TVA_id, print_to_where, color, text_color, cut_group, dinein_takeaway, price, price2, Xu_class, cid, rid, custom, custom2)
VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
"""
insert_category_query = """
INSERT INTO category (name, Xu_class, rid)
VALUES (%s, %s, %s)
"""
select_category_query = """
SELECT id FROM category WHERE name = %s AND rid = %s
"""
last_insert_id_query = "SELECT LAST_INSERT_ID()"
select_tva_id_query = "SELECT id FROM tva WHERE countryEnglish = %s AND category = %s"
select_all_printer_query = "SELECT id_printer FROM printe_to_where WHERE rid = %s"

# select_product_Xu_class_query = "SELECT id FROM tva WHERE countryEnglish = %s AND category = %s"

def import_data(window, file):
    connection = create_connection(host_name, user_name, user_password, db_name)
    if not connection:
        return
    
    product_data = []

    e = delete_all_data(window, connection, restaurantId)
    if e:
        QMessageBox.warning(window, "Delete Failed", f"Delete old data failed:\n\n{e}")
        return

    with open(file, 'r', encoding='gbk') as csvfile:

        failed = []
        id_list = []
        id_takeaway = []
        allprinters_recv = execute_fetch_query(connection, select_all_printer_query, (restaurantId,))
        allprinters = [printer[0] for printer in allprinters_recv]

        for line in csvfile.readlines():
            line = line.strip().split(';') # 使用strip()去掉行尾的换行符

            if len(line) < 12:
                failed.append(f"failed to add product:{line} --- Insufficient data")
                continue
            id, name, price, Xu_class, category_name, zname, TVA_category, printer, color, cut_group, custom1, custom2 = line[:12]

            category_id = get_or_create_category_id(connection, category_name, Xu_class, restaurantId)
            if not category_id:
                failed.append(f"'{id};{name};{category_name}' --- category create failed")
                continue

            dinein_takeaway = 1
            if Xu_class == 'meeneem.txt':
                if id in id_takeaway:
                    failed.append(f"'{id};{name}' --- ID duplicated")
                    continue
                if id == '---':
                    id = 'hyphen3'
                    dinein_takeaway = 2
                else:
                    id_takeaway.append(id)
                    # if id in id_list:
                    #     dinein_takeaway = 3
                    #     # (connection, product, 'dinein_takeaway=%s, takeaway_content=%s', 'id_Xu = %s',(dinein_takeaway, name, id))
                    # else:
                    dinein_takeaway = 2
            else:
                if id in id_list:
                    failed.append(f"'{id};{name}' --- ID duplicated")
                    continue
                if id == '---':
                    id = 'hyphen3'
                    dinein_takeaway = 1
                else:
                    id_list.append(id)
                    # if id in id_takeaway:
                    #     dinein_takeaway = 3
                    # else:
                    dinein_takeaway = 1

            bill_content, exceed = truncate_string(name, lengthContent)
            if exceed:
                QMessageBox.warning(window, 'Name over the limit:', f'ID:{id}\nname:{name}')


            # get tva_id
            tva_id = None
            if TVA_category == 'A':
                TVA_category = 1
            elif TVA_category == 'B':
                TVA_category = 2
            elif TVA_category == 'C':
                TVA_category = 3
            elif TVA_category == 'D':
                TVA_category = 4
            else:
                QMessageBox.warning(window, f"fetch tva failed for product '{id};{name}'", f"This tva {TVA_category} does not exist !")
                continue
            
            try:
                tva_id = execute_fetch_query(connection, select_tva_id_query, (country, TVA_category))[0][0]
            except Error as e:
                print(f"The error '{e}' occurred when getting tva")
                QMessageBox.warning(window, f"fetch tva failed for product '{id};{name}'", f"The error '{e}' occurred when getting tva")
                continue
            
            # set color
            if color:
                r, g, b = color.split(' ')
                bg_color = f"rgb({','.join([r, g, b])})"
                text_color = set_text_color(int(r), int(g), int(b))
            else:
                bg_color = 'rgb(255,255,255)'
                text_color = 'rgb(0,0,0)'

            printer_list = list(str(printer))
            printer_list_copy = printer_list[:]
            printer_removed = ''
            # 判断printer是否为空
            if printer_list_copy!=[]:
                # 检查printerID是否都存在，删去不存在的id
                for printer_id in printer_list_copy:
                    if int(printer_id) not in allprinters:
                        printer_list.remove(printer_id)
                        printer_removed += printer_id
            else:
                QMessageBox.warning(window, f"printer error", f"Printer for product '{id};{name}' is null")

            # 删去不存在的printer后，提示printerID不存在
            # 若全被删去，则printer变成1
            if printer_removed != '':
                failed.append(f"printers of product '{id};{name}' don't exist: {printer_removed}")
            if printer_list==[]:
                printer = 1
            else:
                printer = int(''.join(printer_list))

            if not cut_group:
                cut_group = -1



# (id_Xu, bill_content, kitchen_content, zname, TVA_id, print_to_where, color, text_color, cut_group, dinein_takeaway, price, price2, Xu_class, cid, rid, custom, custom2)
            product_data.append(
                (id, bill_content, bill_content, zname, tva_id, printer, bg_color, text_color, cut_group, dinein_takeaway, price, price, Xu_class, category_id, restaurantId, custom1, custom2)
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




def delete_all_data(window, connection, restaurantId):
    delete_product_query = """
    DELETE FROM product WHERE rid = %s
    """
    delete_category_query = """
    DELETE FROM category WHERE rid = %s
    """
    select_Xu_class_query = "SELECT Xu_class FROM product WHERE rid = %s"
    files_recv = execute_fetch_query(connection, select_Xu_class_query, (restaurantId,))

    e_product = execute_query(connection, delete_product_query, (restaurantId,))
    if e_product:
        return e_product

    e_category = execute_query(connection, delete_category_query, (restaurantId,))

    # delete all files
    for file in files_recv:
        file_name = file[0]
        file_path = os.path.join(window.path, file_name)
        if os.path.exists(file_path):
            os.remove(file_path)
    return e_category


def get_or_create_category_id(connection, category_name, Xu_class, restaurantId):
    category_data = (category_name, Xu_class, restaurantId)

    id = execute_fetch_query(connection, select_category_query, (category_name, restaurantId))

    if not id:
        if execute_query(connection, insert_category_query, category_data):
            return None
        return execute_fetch_query(connection, last_insert_id_query, ())[0][0]
    return id[0][0]


# 以防用户输入content大于25字符
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


# 根据颜色深浅，设置文本颜色
def set_text_color(r, g, b):
    # 计算亮度
    luminance = 0.299 * r + 0.587 * g + 0.114 * b

    # 设置阈值
    if luminance > 128:
        return 'rgb(0, 0, 0)'
    else:
        return 'rgb(255, 255, 255)'
