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
    class: { params: ["object|string"] },
    translate: { params: ["string"], optionalParams: ["object"] }
};

const DIRECTIVE_REGEX = /@(\w+)\(([^)]*)\)/g;

function validateDirective(directive: string, params: string): string | null {
    const rule = DIRECTIVE_RULES[directive];
    if (!rule) return null; // Unknown directive

    const paramList = params.split(",").map((p) => p.trim());
    if (paramList.length < rule.params.length) {
        return `@${directive} expects at least ${rule.params.length} parameter(s).`;
    }

    rule.params.forEach((expectedType, index) => {
        const param = paramList[index];
        if (!param || !validateParamType(param, expectedType)) {
            return `@${directive} parameter ${index + 1} should be of type ${expectedType}.`;
        }
    });

    return null; // No error
}

function validateParamType(param: string, expectedType: string): boolean {
    switch (expectedType) {
        case "string":
            return /^(['"]).*\1$/.test(param); // Check for quoted strings
        case "object":
            return param.startsWith("{") && param.endsWith("}");
        case "object|string":
            return validateParamType(param, "object") || validateParamType(param, "string");
        default:
            return false;
    }
}


function validateDocument(text: string): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];
    let match: RegExpExecArray | null;

    while ((match = DIRECTIVE_REGEX.exec(text)) !== null) {
        const directive = match[1];
        const params = match[2];
        const error = validateDirective(directive, params);

        if (error) {
            diagnostics.push({
                severity: DiagnosticSeverity.Error,
                range: {
                    start: { line: 0, character: match.index }, // Adjust line/character dynamically
                    end: { line: 0, character: match.index + match[0].length }
                },
                message: error,
                source: "PyBlade"
            });
        }
    }

    return diagnostics;
}



// Create a connection
const connection = createConnection(ProposedFeatures.all);

// Manage text documents
const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

connection.onInitialize((params: InitializeParams) => {
    return {
        capabilities: {
            textDocumentSync: TextDocumentSyncKind.Full,
            hoverProvider: true,
            completionProvider: {
                resolveProvider: true,
                triggerCharacters: ["@"]
            },
        },
    };
});

connection.onHover((params: TextDocumentPositionParams): Hover | undefined => {
    const document = documents.get(params.textDocument.uri);
    if (!document) return undefined;

    const position = params.position;
    const line = document.getText({
        start: { line: position.line, character: 0 },
        end: { line: position.line, character: Number.MAX_VALUE }
    });

    // Extract the directive being hovered over
    const match = line.match(/@(\w+)/);
    if (match) {
        const directive = match[1];
        if (DIRECTIVE_INFO[directive]) {
            return {
                contents: {
                    kind: MarkupKind.Markdown,
                    value: `**@${directive}**: ${DIRECTIVE_INFO[directive]}`
                }
            };
        }
    }
});

// Handle completion requests
connection.onCompletion((params) => {
    return Object.keys(DIRECTIVE_INFO).map((directive) => ({
        label: `@${directive}`,
        kind: CompletionItemKind.Function,
        documentation: {
            kind: MarkupKind.Markdown,
            value: DIRECTIVE_INFO[directive.slice(1, 2)]
        }
    }));
});

documents.onDidChangeContent((change) => {
    connection.console.log("Hello")
    const diagnostics = validateDocument(change.document.getText());
    console.log("Diagno", diagnostics)
    connection.sendDiagnostics({ uri: change.document.uri, diagnostics });
});


// Listen to document events
documents.listen(connection);

// Listen to the connection
connection.listen();
