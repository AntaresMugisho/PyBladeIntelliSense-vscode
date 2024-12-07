import {
    createConnection,
    InitializeParams,
    ProposedFeatures,
    TextDocumentSyncKind,
    TextDocuments,
    CompletionItemKind,
    Hover,
    Diagnostic, 
    DiagnosticSeverity,
    TextDocumentPositionParams,
    MarkupKind
} from 'vscode-languageserver/node';

import { TextDocument } from 'vscode-languageserver-textdocument';


const DIRECTIVE_INFO: Record<string, string> = {
    url: "Accepts a string: the relative or absolute URL (e.g., @url('home')).",
    static: "Accepts a string: the path to the static resource (e.g., @static('css/style.css')).",
    class: "Accepts a dictionary or string: dynamic class generation (e.g., @class({'active': isActive})).",
    translate: "Accepts a key and optional replacements: localized string (e.g., @translate('welcome', {'user': 'John'}))."
};

const DIRECTIVE_RULES: Record<string, { params: string[], optionalParams?: string[] }> = {
    url: { params: ["string"] },
    static: { params: ["string"] },
    inlcude: { params: ["string"] },
    class: { params: ["object"] },
    translate: { params: ["string"], optionalParams: ["object"] }
};

const DIRECTIVE_REGEX = /@(\w+)\(([^)]*)\)/g;


// Create a connection
const connection = createConnection(ProposedFeatures.all);

// Manage text documents
const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

connection.onInitialize((params: InitializeParams) => {
    return {
        capabilities: {
            textDocumentSync: TextDocumentSyncKind.Full,
            // hoverProvider: true,
            // completionProvider: {
            //     resolveProvider: true,
            //     triggerCharacters: ["@"]
            // },
        },
    };
});


documents.listen(connection);
connection.listen();
