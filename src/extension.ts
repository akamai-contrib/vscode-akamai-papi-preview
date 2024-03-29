// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	context.subscriptions.push(
		vscode.commands.registerCommand('akamai-papi-preview.preview', function () {
			if (vscode.window.activeTextEditor) {
				let relFileName = vscode.workspace.asRelativePath(vscode.window.activeTextEditor?.document.fileName);

				PreviewPanel.show(
					context,
					vscode.window.createWebviewPanel(
						"akamai-papi-preview.preview-panel",
						`Preview: ${relFileName}`,
						vscode.window.activeTextEditor?.viewColumn || vscode.ViewColumn.One,
						{
							enableFindWidget: true,
							retainContextWhenHidden: false,
							enableScripts: true,
						}
					)
				)
			}
		})
	);
}

class PreviewPanel {
	static show(context: vscode.ExtensionContext, panel: vscode.WebviewPanel) {
		const outline = new PreviewPanel(context, panel);
	}

	readonly context: vscode.ExtensionContext;
	readonly panel: vscode.WebviewPanel;

	private constructor(context: vscode.ExtensionContext, panel: vscode.WebviewPanel) {
		this.context = context;
		this.panel = panel;
		this.create();
		this.reveal();
	}

	private get webview(): vscode.Webview {
		return this.panel.webview;
	}

	private get initialData(): any {
		return vscode.window.activeTextEditor?.document.getText();
	}

	private getUri(...components: string[]): vscode.Uri {
		return vscode.Uri.joinPath(this.context.extensionUri, ...components).with({scheme: "vscode-resource"});
	}

	public create() {
		this.panel.webview.html = `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta http-equiv="Content-Security-Policy" content="default-src ${this.webview.cspSource}; img-src 'unsafe-inline' ${this.webview.cspSource} https:; script-src 'unsafe-inline' 'unsafe-eval' ${this.webview.cspSource}; style-src 'unsafe-inline' ${this.webview.cspSource};">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<title>${this.panel.title}</title>
			</head>
			<body>
			</body>
			<script>
				window.initialData = ${JSON.stringify(escape(this.initialData))};
			</script>
			<script src="${this.getUri("dist", "preview-panel.js")}"></script>
			</html>
		`;
	}

	public reveal() {
		this.panel.reveal();
	}
}

// this method is called when your extension is deactivated
export function deactivate() {}
