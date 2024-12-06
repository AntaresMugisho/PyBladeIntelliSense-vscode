import {
    createConnection,
    TextDocuments,
    Diagnostic,
    DiagnosticSeverity,
    InitializeParams,
    ProposedFeatures,
    TextDocumentSyncKind,
} from 'vscode-languageserver/node';
import { TextDocument } from 'vscode-languageserver-textdocument';

// Create a connection
const connection = createConnection(ProposedFeatures.all);

// Manage text documents
const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

connection.onInitialize((_params: InitializeParams) => {
    return {
        capabilities: {
            textDocumentSync: TextDocumentSyncKind.Full,
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
