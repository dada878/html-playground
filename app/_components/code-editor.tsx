"use client";

import React, { useRef } from "react";

import Editor, { useMonaco } from "@monaco-editor/react";

export default function CodeEditor({
  value,
  onChange,
  fontSize = 16,
  showLineNumber = true,
}: {
  value: string;
  onChange: (value?: string) => void;
  fontSize: number;
  showLineNumber: boolean;
}) {
  const inited = useRef(false);
  const monaco = useMonaco();
  if (monaco && monaco?.languages && !inited.current) {
    inited.current = true;
    monaco?.languages.registerCompletionItemProvider("html", {
      triggerCharacters: [">"],
      provideCompletionItems: (model, position) => {
        const codePre = model.getValueInRange({
          startLineNumber: position.lineNumber,
          startColumn: 1,
          endLineNumber: position.lineNumber,
          endColumn: position.column,
        });

        const tag = codePre.match(/.*<(\w+)>$/)?.[1];

        if (!tag) {
          return;
        }

        const word = model.getWordUntilPosition(position);

        return {
          suggestions: [
            {
              label: `</${tag}>`,
              kind: monaco.languages.CompletionItemKind.EnumMember,
              insertText: `$1</${tag}>`,
              insertTextRules:
                monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              range: {
                startLineNumber: position.lineNumber,
                endLineNumber: position.lineNumber,
                startColumn: word.startColumn,
                endColumn: word.endColumn,
              },
            },
          ],
        };
      },
    });
  }
  return (
    <>
      <Editor
        options={{
          fontSize: fontSize,
          lineNumbers: showLineNumber ? "on" : "off",
          padding: {
            top: 20,
          },
        }}
        className="w-full h-full resize text-xl rounded-md"
        onChange={(e) => {
          onChange(e);
        }}
        value={value}
        theme="vs-dark"
        defaultLanguage="html"
      />
    </>
  );
}
