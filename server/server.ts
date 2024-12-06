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
import { getCompletionItems } from './handlers';

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

// Do completion
connection.onCompletion(() => {
    return getCompletionItems();
});


// Syntax Check
documents.onDidChangeContent((change) => {
    validateTextDocument(change.document);
});

async function validateTextDocument(textDocument: TextDocument): Promise<void> {
    const text = textDocument.getText();
    const diagnostics: Diagnostic[] = [];

    const regex = /@(\w+)/g;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
        const directive = match[1];
        if (!['if', 'elif', 'extends', 'yield', 'switch'].includes(directive)) {
            diagnostics.push({
                severity: DiagnosticSeverity.Error,
                range: {
                    start: textDocument.positionAt(match.index),
                    end: textDocument.positionAt(match.index + match[0].length),
                },
                message: `Unknown directive: @${directive}`,
                source: 'PyBlade',
            });
        }
    }

    connection.sendDiagnostics({ uri: textDocument.uri, diagnostics });
}

// Listen to document events
documents.listen(connection);

// Listen to the connection
connection.listen();
