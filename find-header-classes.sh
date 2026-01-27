#!/bin/bash

# Скрипт поиска всех CSS классов .header с указанием файлов-источников

echo "🔍 Поиск всех CSS классов .header в проекте..."
echo "================================================"

# Создаем временный файл для результатов
results_file="header_classes_report.txt"
echo "Отчет по CSS классам .header" > $results_file
echo "Дата: $(date)" >> $results_file
echo "================================================" >> $results_file

# Функция поиска в файле
search_in_file() {
    local file="$1"
    local matches=$(grep -n "\.header" "$file" 2>/dev/null)
    
    if [ ! -z "$matches" ]; then
        echo "" >> $results_file
        echo "📁 Файл: $file" >> $results_file
        echo "---" >> $results_file
        
        while IFS= read -r line; do
            echo "  $line" >> $results_file
        done <<< "$matches"
        
        # Выводим в консоль тоже
        echo ""
        echo "📁 $file"
        echo "$matches"
    fi
}

# Поиск во всех CSS файлах
echo "Сканирование CSS файлов..."

# Основные CSS файлы
find "d:/BlogPro/client/src" -name "*.css" -type f | while read -r file; do
    search_in_file "$file"
done

# Поиск глобального правила header (без точки)
echo "" >> $results_file
echo "🚨 ПОИСК ГЛОБАЛЬНОГО ПРАВИЛА 'header {'" >> $results_file
echo "================================================" >> $results_file

find "d:/BlogPro/client/src" -name "*.css" -type f | while read -r file; do
    matches=$(grep -n "^header\s*{" "$file" 2>/dev/null)
    if [ ! -z "$matches" ]; then
        echo "" >> $results_file
        echo "❌ НАЙДЕНО ГЛОБАЛЬНОЕ ПРАВИЛО в: $file" >> $results_file
        echo "  $matches" >> $results_file
        
        echo ""
        echo "❌ НАЙДЕНО ГЛОБАЛЬНОЕ ПРАВИЛО в: $file"
        echo "$matches"
    fi
done

# Поиск специфичных стилей из проблемного правила
echo "" >> $results_file
echo "🎯 ПОИСК ПРОБЛЕМНЫХ СТИЛЕЙ" >> $results_file
echo "================================================" >> $results_file

problem_styles=("display: flex" "align-items: center" "justify-content: space-between" "padding: 1rem 2rem" "background: #1e293b")

for style in "${problem_styles[@]}"; do
    echo "" >> $results_file
    echo "Поиск: $style" >> $results_file
    
    find "d:/BlogPro/client/src" -name "*.css" -type f | while read -r file; do
        matches=$(grep -n "$style" "$file" 2>/dev/null)
        if [ ! -z "$matches" ]; then
            echo "  📁 $file" >> $results_file
            echo "    $matches" >> $results_file
        fi
    done
done

echo ""
echo "✅ Поиск завершен!"
echo "📄 Результаты сохранены в: $results_file"
echo ""
echo "Для просмотра результатов:"
echo "cat $results_file"