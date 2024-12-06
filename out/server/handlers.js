"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCompletionItems = getCompletionItems;
const node_1 = require("vscode-languageserver/node");
function getCompletionItems() {
    return [
        {
            label: '@if',
            kind: node_1.CompletionItemKind.Keyword,
            detail: 'PyBlade If Directive',
            insertText: '@if()',
        },
        {
            label: '@extends',
            kind: node_1.CompletionItemKind.Keyword,
            detail: 'PyBlade Extends Directive',
            insertText: '@extends("")',
        },
        // Add more directives as needed
    ];
}
//# sourceMappingURL=handlers.js.map