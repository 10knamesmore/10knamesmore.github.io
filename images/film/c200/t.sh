#!/bin/bash

# 遍历当前目录中的所有 PNG 文件
for png_file in ./*.png; do
    # 检查是否有 PNG 文件
    if [ -e "$png_file" ]; then
        # 提取文件名（不包括路径和扩展名）
        base_name=$(basename "$png_file" .png)
        # 定义输出文件的路径和文件名
        jpg_file="./${base_name}.jpg"
        # 使用 GraphicsMagick 的 gm convert 命令进行转换
        gm convert "$png_file" "$jpg_file"
        echo "Converted $png_file to $jpg_file"
    else
        echo "No PNG files found in the current directory."
        break
    fi
done

