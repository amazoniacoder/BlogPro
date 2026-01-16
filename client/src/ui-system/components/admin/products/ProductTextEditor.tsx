import React, { useEffect, useState } from 'react';
import { EditorContainer } from '../../../../plugins/texteditor/core/components/EditorContainer';

interface ProductTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export const ProductTextEditor: React.FC<ProductTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Enter product description...'
}) => {
  const [content, setContent] = useState(value);

  useEffect(() => {
    setContent(value);
  }, [value]);

  const handleChange = (newContent: string) => {
    setContent(newContent);
    onChange(newContent);
  };

  return (
    <div className="product-text-editor">
      <EditorContainer
        initialContent={content}
        onChange={handleChange}
        placeholder={placeholder}
        className="product-text-editor__container"
      />
    </div>
  );
};
