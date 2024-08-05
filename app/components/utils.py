from PyQt5.QtWidgets import QMessageBox
import glob
import os
import requests
import mysql.connector
from mysql.connector import Error
import sshtunnel
from infos.userInfo import restaurantId
from infos.exportImportValue import AbList, HooftNameValue, lengthContent, lengthID

def create_conn_tunnel(ssh_host, ssh_port, ssh_username, ssh_password, mysql_host_name, mysql_port):
    tunnel = None
    try:
        tunnel = sshtunnel.SSHTunnelForwarder(
            (ssh_host, ssh_port),
            ssh_username=ssh_username, ssh_password=ssh_password,
            remote_bind_address=(mysql_host_name, mysql_port),
            local_bind_address=('0.0.0.0', 3001), 
        )
    except Error as e:
        print(f"The error '{e}' occurred")

    return tunnel

def create_connection(host_name, port, user_name, user_password, db_name):
    connection = None
    try:
        print('tunnel.local_bind_port:', port)
        connection = mysql.connector.connect(
            host=host_name,
            port=port, 
            user=user_name,
            password=user_password,
            database=db_name,
            connection_timeout=10,
        )
        print("Connection to MySQL DB successful")
    except Error as e:
        print(f"The error '{e}' occurred")
    return connection