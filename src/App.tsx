import { useState, useRef } from 'react';
import { validateXML, ValidationResult } from './validator';
import './App.css';

export default function App() {
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setFileName(file.name);

    try {
      const text = await file.text();
      const validationResult = validateXML(text);
      setResult(validationResult);
    } catch (error) {
      setResult({
        isValid: false,
        errors: [
          {
            message: `Ошибка при чтении файла: ${error instanceof Error ? error.message : String(error)}`,
            severity: 'error',
          },
        ],
        warnings: [],
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const file = e.dataTransfer.files?.[0];
    if (file && file.name.endsWith('.xml')) {
      fileInputRef.current!.files = e.dataTransfer.files;
      handleFileChange({ target: { files: e.dataTransfer.files } } as any);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const resetForm = () => {
    setResult(null);
    setFileName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="container">
      <div className="card">
        <div className="header">
          <h1>🔍 XML Валидатор Контрактов</h1>
          <p>Загрузите файл контракта для проверки</p>
        </div>

        {!result ? (
          <div className="upload-area" onDrop={handleDrop} onDragOver={handleDragOver}>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xml"
              onChange={handleFileChange}
              disabled={isLoading}
              className="file-input"
            />
            <div className="upload-placeholder">
              <div className="upload-icon">📁</div>
              <p>Перетащите XML файл сюда</p>
              <p className="text-secondary">или нажмите для выбора</p>
              {isLoading && <p className="loading">⏳ Обработка...</p>}
            </div>
          </div>
        ) : (
          <div className="result">
            <div className="file-info">
              <span className="file-name">📄 {fileName}</span>
              <button className="btn-reset" onClick={resetForm}>
                ✕
              </button>
            </div>

            {result.isValid ? (
              <div className="success">
                <div className="success-icon">✅</div>
                <h2>Файл валиден!</h2>
                <p>Все проверки пройдены успешно</p>
              </div>
            ) : (
              <div className="failure">
                <div className="failure-icon">❌</div>
                <h2>Файл содержит ошибки</h2>
              </div>
            )}

            {result.errors.length > 0 && (
              <div className="messages-section">
                <h3 className="section-title errors-title">Ошибки ({result.errors.length})</h3>
                <ul className="messages-list">
                  {result.errors.map((error, i) => (
                    <li key={i} className="message error-message">
                      <span className="message-icon">⚠️</span>
                      {error.field && <span className="field-name">[{error.field}]</span>}
                      <span>{error.message}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {result.warnings.length > 0 && (
              <div className="messages-section">
                <h3 className="section-title warnings-title">Предупреждения ({result.warnings.length})</h3>
                <ul className="messages-list">
                  {result.warnings.map((warning, i) => (
                    <li key={i} className="message warning-message">
                      <span className="message-icon">⚡</span>
                      {warning.field && <span className="field-name">[{warning.field}]</span>}
                      <span>{warning.message}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <button className="btn-primary" onClick={resetForm}>
              Загрузить другой файл
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
