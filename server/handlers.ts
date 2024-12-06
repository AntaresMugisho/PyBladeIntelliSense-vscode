import { CompletionItem, CompletionItemKind } from 'vscode-languageserver/node';

export function getCompletionItems(): CompletionItem[] {
    return [
        {
            label: '@if',
            kind: CompletionItemKind.Keyword,
            detail: 'PyBlade If Directive',
            insertText: '@if()',
        },
        {
            label: '@extends',
            kind: CompletionItemKind.Keyword,
            detail: 'PyBlade Extends Directive',
            insertText: '@extends("")',
        },
        // Add more directives as needed
    ];
}
