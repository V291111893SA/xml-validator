import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef } from 'react';
import { validateXML } from './validator';
import './App.css';
export default function App() {
    const [result, setResult] = useState(null);
    const [fileName, setFileName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef(null);
    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file)
            return;
        setIsLoading(true);
        setFileName(file.name);
        try {
            const text = await file.text();
            const validationResult = validateXML(text);
            setResult(validationResult);
        }
        catch (error) {
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
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const file = e.dataTransfer.files?.[0];
        if (file && file.name.endsWith('.xml')) {
            fileInputRef.current.files = e.dataTransfer.files;
            handleFileChange({ target: { files: e.dataTransfer.files } });
        }
    };
    const handleDragOver = (e) => {
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
    return (_jsx("div", { className: "container", children: _jsxs("div", { className: "card", children: [_jsxs("div", { className: "header", children: [_jsx("h1", { children: "\uD83D\uDD0D XML \u0412\u0430\u043B\u0438\u0434\u0430\u0442\u043E\u0440 \u041A\u043E\u043D\u0442\u0440\u0430\u043A\u0442\u043E\u0432" }), _jsx("p", { children: "\u0417\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u0435 \u0444\u0430\u0439\u043B \u043A\u043E\u043D\u0442\u0440\u0430\u043A\u0442\u0430 \u0434\u043B\u044F \u043F\u0440\u043E\u0432\u0435\u0440\u043A\u0438" })] }), !result ? (_jsxs("div", { className: "upload-area", onDrop: handleDrop, onDragOver: handleDragOver, children: [_jsx("input", { ref: fileInputRef, type: "file", accept: ".xml", onChange: handleFileChange, disabled: isLoading, className: "file-input" }), _jsxs("div", { className: "upload-placeholder", children: [_jsx("div", { className: "upload-icon", children: "\uD83D\uDCC1" }), _jsx("p", { children: "\u041F\u0435\u0440\u0435\u0442\u0430\u0449\u0438\u0442\u0435 XML \u0444\u0430\u0439\u043B \u0441\u044E\u0434\u0430" }), _jsx("p", { className: "text-secondary", children: "\u0438\u043B\u0438 \u043D\u0430\u0436\u043C\u0438\u0442\u0435 \u0434\u043B\u044F \u0432\u044B\u0431\u043E\u0440\u0430" }), isLoading && _jsx("p", { className: "loading", children: "\u23F3 \u041E\u0431\u0440\u0430\u0431\u043E\u0442\u043A\u0430..." })] })] })) : (_jsxs("div", { className: "result", children: [_jsxs("div", { className: "file-info", children: [_jsxs("span", { className: "file-name", children: ["\uD83D\uDCC4 ", fileName] }), _jsx("button", { className: "btn-reset", onClick: resetForm, children: "\u2715" })] }), result.isValid ? (_jsxs("div", { className: "success", children: [_jsx("div", { className: "success-icon", children: "\u2705" }), _jsx("h2", { children: "\u0424\u0430\u0439\u043B \u0432\u0430\u043B\u0438\u0434\u0435\u043D!" }), _jsx("p", { children: "\u0412\u0441\u0435 \u043F\u0440\u043E\u0432\u0435\u0440\u043A\u0438 \u043F\u0440\u043E\u0439\u0434\u0435\u043D\u044B \u0443\u0441\u043F\u0435\u0448\u043D\u043E" })] })) : (_jsxs("div", { className: "failure", children: [_jsx("div", { className: "failure-icon", children: "\u274C" }), _jsx("h2", { children: "\u0424\u0430\u0439\u043B \u0441\u043E\u0434\u0435\u0440\u0436\u0438\u0442 \u043E\u0448\u0438\u0431\u043A\u0438" })] })), result.errors.length > 0 && (_jsxs("div", { className: "messages-section", children: [_jsxs("h3", { className: "section-title errors-title", children: ["\u041E\u0448\u0438\u0431\u043A\u0438 (", result.errors.length, ")"] }), _jsx("ul", { className: "messages-list", children: result.errors.map((error, i) => (_jsxs("li", { className: "message error-message", children: [_jsx("span", { className: "message-icon", children: "\u26A0\uFE0F" }), error.field && _jsxs("span", { className: "field-name", children: ["[", error.field, "]"] }), _jsx("span", { children: error.message })] }, i))) })] })), result.warnings.length > 0 && (_jsxs("div", { className: "messages-section", children: [_jsxs("h3", { className: "section-title warnings-title", children: ["\u041F\u0440\u0435\u0434\u0443\u043F\u0440\u0435\u0436\u0434\u0435\u043D\u0438\u044F (", result.warnings.length, ")"] }), _jsx("ul", { className: "messages-list", children: result.warnings.map((warning, i) => (_jsxs("li", { className: "message warning-message", children: [_jsx("span", { className: "message-icon", children: "\u26A1" }), warning.field && _jsxs("span", { className: "field-name", children: ["[", warning.field, "]"] }), _jsx("span", { children: warning.message })] }, i))) })] })), _jsx("button", { className: "btn-primary", onClick: resetForm, children: "\u0417\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044C \u0434\u0440\u0443\u0433\u043E\u0439 \u0444\u0430\u0439\u043B" })] }))] }) }));
}
