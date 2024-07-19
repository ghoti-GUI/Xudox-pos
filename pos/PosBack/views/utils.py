import os
from django.conf import settings

def delete_image(img_path):
    # 检查文件是否存在并删除文件
    if os.path.exists(img_path):
        os.remove(img_path)
    else:
        print(f"File {img_path} not found.")
