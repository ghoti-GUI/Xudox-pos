import requests
import os
import unicodedata
import re
# import csv
import mysql.connector
from mysql.connector import Error
from PyQt5.QtWidgets import QMessageBox, QFileDialog
from PyQt5.QtCore import QTimer
from .export_data import export_data
# from infos.userInfo import restaurantId, lengthContent, load_selected_path
from infos.userInfo import restaurantId, country, save_import_path, load_import_path
from infos.models import productModel, categoryModel
from infos.mysqlInfo import *
from .utils import create_conn_tunnel, create_connection
from infos.exportImportValue import lengthContent, lengthDataMin, lengthDataFull

# Close connection
def close_connection(connection):
    if connection.is_connected():
        connection.close()
        print("The connection is closed")

# Create import button
def create_import_data_button(window, layout):
    from PyQt5.QtWidgets import QPushButton

    btn_import = QPushButton('Import Data', window)
    btn_import.clicked.connect(lambda: handle_file_select(window))
    layout.addWidget(btn_import)

# File selection window pops up
def handle_file_select(window):
    options = QFileDialog.Options()
    initial_path = load_import_path()
    file_name, _ = QFileDialog.getOpenFileName(window, "Select Import File", initial_path, "CSV Files (*.csv);;All Files (*)", options=options)
    if file_name:
        # After selecting a file, save the path to the selected folder for the next selection.
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

def execute_fetch_query(connection, query, data=None):
    cursor = connection.cursor(buffered=True)
    try:
        if data:
            cursor.execute(query, data)
        else:
            cursor.execute(query)
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
INSERT INTO product (id_Xu, bill_content, kitchen_content, online_content, TVA_id, print_to_where, color, text_color, cut_group, dinein_takeaway, price, price2, Xu_class, cid, rid, custom, custom2)
VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
"""
insert_category_query = """
INSERT INTO category (name, Xu_class, rid)
VALUES (%s, %s, %s)
"""
select_category_query = """
SELECT id, Xu_class FROM category WHERE name = %s AND rid = %s
"""
update_Xu_class_category_query = "UPDATE category SET Xu_class = %s WHERE id = %s AND rid = %s"

last_insert_id_query = "SELECT LAST_INSERT_ID()"
select_tva_id_query = "SELECT id FROM tva WHERE countryEnglish = %s AND category = %s"
select_all_printer_query = "SELECT id_printer FROM printe_to_where WHERE rid = %s"
select_all_ablist_kitchen_nonull_query = 'SELECT Xu_class FROM ablist_kitchen_nonull'

def import_data(window, file):
    # 建立数据库连接
    connection = create_connection(host_name, mysql_port, user_name, user_password, db_name)
    if connection.is_connected():
        product_data = []
        # 删除所有数据库中的数据和文件
        e = delete_all_data(window, connection, restaurantId)
        if e:
            QMessageBox.warning(window, "Delete Failed", f"Delete old data failed:\n\n{e}")
            return

        with open(file, 'r', encoding='gbk') as csvfile:
            failed = [] # 用来储存所有保存失败的数据
            id_list = [] # 存储出现过的餐楼的id
            id_takeaway = [] # 存储出现过的外卖的id
            # 获取所有printer的id
            allprinters_recv = execute_fetch_query(connection, select_all_printer_query, (restaurantId,))
            ablist_kitchencontetn_nonull_recv = execute_fetch_query(connection, select_all_ablist_kitchen_nonull_query)
            # print('ablist_kitchencontetn_nonull_recv:', ablist_kitchencontetn_nonull_recv)
            # print('allprinters_recv:', allprinters_recv)
            if(allprinters_recv and len(allprinters_recv)>0):
                allprinters = [printer[0] for printer in allprinters_recv]
            else:
                allprinters = []

            for line_origin in csvfile.readlines():
                line = line_origin.split(';') # 分割后结尾会多出一个'\n'数据

                if len(line) < lengthDataMin+1:
                    failed.append(f"'{line_origin}' --- Insufficient data, {lengthDataMin+1-len(line)} datas are missing")
                    continue
                line += [None]*(lengthDataFull+1-len(line))
                id, name, price, Xu_class, category_name, zname, TVA_category, printer, color, cut_group, custom1, custom2 = line[:lengthDataFull]

                # 通过category_name获取cid，若category_name不存在则创建新的category
                category_id = get_or_create_category_id(connection, category_name, Xu_class, restaurantId)
                if not category_id:
                    failed.append(f"'{id};{name};{category_name}' --- category create failed")
                    continue

                # 通过Xu_class == 'meeneem.txt'判断是餐楼还是外带，并给dinein_takeaway赋值
                dinein_takeaway = 1
                if Xu_class == 'meeneem.txt':
                    if id in id_takeaway:
                        failed.append(f"'{id};{name}' --- ID duplicated in take-away menu")
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
                        failed.append(f"'{id};{name}' --- ID duplicated in dine-in menu")
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

                # 切割content中超过25个字符的部分，转化特殊字符
                bill_content = normalize_string(name)
                bill_content, exceed_bill = truncate_string(bill_content, lengthContent)
                # if exceed:
                #     QMessageBox.warning(window, 'Name over the limit:', f'ID:{id}\nname:{name}')

                if zname:
                    zname = normalize_string(zname)
                    zname, exceed_z = truncate_string(zname, lengthContent)
                elif (Xu_class,) in ablist_kitchencontetn_nonull_recv:
                    zname = bill_content
                

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
                
                # 通过tva_category和储存在config.ini文件中的country获取tva_id
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

                # (id_Xu, bill_content, kitchen_content, online_content, TVA_id, print_to_where, color, text_color, cut_group, dinein_takeaway, price, price2, Xu_class, cid, rid, custom, custom2)
                product_data.append(
                    (id, bill_content, zname, name, tva_id, printer, bg_color, text_color, cut_group, dinein_takeaway, price, price, Xu_class, category_id, restaurantId, custom1, custom2)
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



# 删除所有数据库中的数据，以及本地数据文件
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

# 通过name获取cid，若name不存在则创建category
# 如果已存在的category的Xu_class是‘meeneem.txt’，且product的Xu_class不是‘meeneem.txt’，则修改category的Xu_class
def get_or_create_category_id(connection, category_name, Xu_class, restaurantId):
    category_data = (category_name, Xu_class, restaurantId)

    category_result = execute_fetch_query(connection, select_category_query, (category_name, restaurantId))

    if not category_result:
        # 不存在则创建新的category
        if execute_query(connection, insert_category_query, category_data):
            return None
        return execute_fetch_query(connection, last_insert_id_query, ())[0][0]
    else:
        id = category_result[0][0]
        Xu_class_category = category_result[0][1]
        # 输入的product的Xu_class不是‘meeneem.txt’，且获取的category的Xu_class是‘meeneem.txt’，则修改category的Xu_class
        if Xu_class!='meeneem.txt' and Xu_class_category=='meeneem.txt':
            execute_query(connection, update_Xu_class_category_query, (Xu_class, id, restaurantId))
        return id


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

def normalize_string(string):
    normalized_str = unicodedata.normalize('NFD', string)
    # 使用正则表达式去除音标和组合字符
    cleaned_str = re.sub(r'[\u0300-\u036f]', '', normalized_str)
    return cleaned_str


# 根据颜色深浅，设置文本颜色
def set_text_color(r, g, b):
    # 计算亮度
    luminance = 0.299 * r + 0.587 * g + 0.114 * b

    # 设置阈值
    if luminance > 128:
        return 'rgb(0, 0, 0)'
    else:
        return 'rgb(255, 255, 255)'
