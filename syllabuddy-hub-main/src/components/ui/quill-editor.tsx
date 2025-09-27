import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';

// Define Quill types
interface QuillInstance {
  getContents(): any;
  setContents(delta: any): void;
  getText(): string;
  getHTML(): string;
  root: HTMLElement;
  on(event: string, handler: Function): void;
  off(event: string, handler: Function): void;
}

declare global {
  interface Window {
    Quill: any;
  }
}

interface QuillEditorProps {
  value?: string;
  onChange?: (content: string) => void;
  placeholder?: string;
  theme?: 'snow' | 'bubble';
  readOnly?: boolean;
  className?: string;
}

export interface QuillEditorRef {
  getContent: () => string;
  setContent: (content: string) => void;
  getText: () => string;
  focus: () => void;
}

const QuillEditor = forwardRef<QuillEditorRef, QuillEditorProps>(({
  value = '',
  onChange,
  placeholder = 'Start writing...',
  theme = 'snow',
  readOnly = false,
  className = ''
}, ref) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<QuillInstance | null>(null);
  const isInitialized = useRef(false);

  useImperativeHandle(ref, () => ({
    getContent: () => {
      if (quillRef.current) {
        return quillRef.current.root.innerHTML || '';
      }
      return value || '';
    },
    setContent: (content: string) => {
      if (quillRef.current) {
        quillRef.current.root.innerHTML = content;
      }
    },
    getText: () => {
      if (quillRef.current) {
        return quillRef.current.getText() || '';
      }
      return '';
    },
    focus: () => {
      if (quillRef.current) {
        quillRef.current.root.focus();
      }
    }
  }));

  useEffect(() => {
    const initializeQuill = () => {
      if (!editorRef.current || isInitialized.current || !window.Quill) return;

      try {
        const toolbarOptions = [
          [{ 'header': [1, 2, 3, false] }],
          ['bold', 'italic', 'underline', 'strike'],
          [{ 'color': [] }, { 'background': [] }],
          [{ 'list': 'ordered' }, { 'list': 'bullet' }],
          ['blockquote', 'code-block'],
          ['link'],
          ['clean']
        ];

        quillRef.current = new window.Quill(editorRef.current, {
          theme,
          readOnly,
          placeholder,
          modules: {
            toolbar: toolbarOptions
          }
        });

        // Set initial content
        if (value) {
          quillRef.current.root.innerHTML = value;
        }

        // Handle content changes
        quillRef.current.on('text-change', () => {
          if (onChange && quillRef.current) {
            const content = quillRef.current.root.innerHTML || '';
            onChange(content);
          }
        });

        isInitialized.current = true;
      } catch (error) {
        console.error('Failed to initialize Quill:', error);
      }
    };

    // Load Quill if not already loaded
    if (!window.Quill) {
      // Load CSS
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdnjs.cloudflare.com/ajax/libs/quill/2.0.2/quill.snow.min.css';
      document.head.appendChild(link);

      // Load JS
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/quill/2.0.2/quill.min.js';
      script.onload = () => {
        setTimeout(initializeQuill, 100);
      };
      document.head.appendChild(script);
    } else {
      initializeQuill();
    }

    return () => {
      isInitialized.current = false;
    };
  }, []);

  // Update content when value prop changes
  useEffect(() => {
    if (quillRef.current && value !== quillRef.current.root.innerHTML) {
      quillRef.current.root.innerHTML = value;
    }
  }, [value]);

  return (
    <div className={`quill-editor-wrapper ${className}`}>
      <div
        ref={editorRef}
        className="quill-editor"
        style={{ minHeight: '200px' }}
      />
      <style jsx>{`
        .quill-editor-wrapper {
          border: 1px solid #e5e7eb;
          border-radius: 0.375rem;
          overflow: hidden;
        }
        .quill-editor-wrapper .ql-toolbar {
          border: none;
          border-bottom: 1px solid #e5e7eb;
          background-color: #f9fafb;
        }
        .quill-editor-wrapper .ql-container {
          border: none;
          font-family: inherit;
        }
        .quill-editor-wrapper .ql-editor {
          padding: 12px;
          min-height: 200px;
        }
      `}</style>
    </div>
  );
});

QuillEditor.displayName = 'QuillEditor';

export default QuillEditor;