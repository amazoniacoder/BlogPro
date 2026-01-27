#!/bin/bash

# Скрипт поиска и удаления проблемного CSS правила header

echo "🔍 Поиск проблемного CSS правила 'header {'..."

# Создаем временный файл для поиска
temp_file="temp_search.txt"

# Ищем в основных CSS файлах
echo "Проверяем основные файлы..."

# Проверяем main.css
if grep -n "^header {" "d:/BlogPro/client/src/ui-system/main.css" 2>/dev/null; then
    echo "❌ Найдено в main.css"
fi

# Проверяем index.css
if grep -n "^header {" "d:/BlogPro/client/src/ui-system/index.css" 2>/dev/null; then
    echo "❌ Найдено в index.css"
fi

# Проверяем все CSS файлы в ui-system
echo "Проверяем все CSS файлы в ui-system..."
find "d:/BlogPro/client/src/ui-system" -name "*.css" -exec grep -l "^header {" {} \; 2>/dev/null

# Проверяем конкретное правило
echo "Ищем правило с указанными стилями..."
find "d:/BlogPro/client/src" -name "*.css" -exec grep -l "display: flex" {} \; | xargs grep -l "align-items: center" | xargs grep -l "justify-content: space-between" | xargs grep -l "padding: 1rem 2rem" | xargs grep -l "background: #1e293b"

echo "✅ Поиск завершен"