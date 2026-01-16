import PyPDF2
import re
import sys

def extract_words_from_pdf(pdf_path, output_path):
    words = set()
    
    try:
        with open(pdf_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            
            for page in pdf_reader.pages:
                text = page.extract_text()
                # Извлекаем только русские слова
                russian_words = re.findall(r'[а-яё]+', text.lower())
                words.update(russian_words)
        
        # Сортируем и сохраняем
        sorted_words = sorted(list(words))
        
        with open(output_path, 'w', encoding='utf-8') as output_file:
            for word in sorted_words:
                if len(word) > 1:  # Исключаем односимвольные слова
                    output_file.write(word + '\n')
        
        print(f"Извлечено {len(sorted_words)} слов в файл {output_path}")
        
    except Exception as e:
        print(f"Ошибка: {e}")

if __name__ == "__main__":
    pdf_path = "D:/BlogPro/client/src/plugins/texteditor/Dictionary/tolkovyj-slovar-sovr_-russkogo-jazyka_ushako-d_n_2014-800s.pdf"
    output_path = "D:/BlogPro/public/assets/dictionaries/ru-ushakov-words.txt"
    
    extract_words_from_pdf(pdf_path, output_path)