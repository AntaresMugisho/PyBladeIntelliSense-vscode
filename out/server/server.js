"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_1 = require("vscode-languageserver/node");
const vscode_languageserver_textdocument_1 = require("vscode-languageserver-textdocument");
// Create a connection
const connection = (0, node_1.createConnection)(node_1.ProposedFeatures.all);
// Manage text documents
const documents = new node_1.TextDocuments(vscode_languageserver_textdocument_1.TextDocument);
connection.onInitialize((_params) => {
    return {
        capabilities: {
            textDocumentSync: node_1.TextDocumentSyncKind.Full,
            completionProvider: {
                resolveProvider: true,
            },
        },
    };
});
// Handle document changes
documents.onDidChangeContent((change) => {
    connection.console.log(`Content changed in: ${change.document.uri}`);
});
// Listen to document events
documents.listen(connection);
// Listen to the connection
connection.listen();
//# sourceMappingURL=server.js.map