import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import * as tmp from 'tmp';

const apiUrl = "http://192.168.166.203:5000/error";

export async function activate(context: vscode.ExtensionContext) {
  console.log('⚡ Extension aktiviert');

  const expectedOutput = [
    '    1',
    '   2 2',
    '  3   3',
    ' 4     4',
    '5       5'
  ].join('\n');

  const challenge = [
    '# Aufgabe: Gib exakt folgenden Output aus:',
    '#',
    '#      1',
    '#     2 2',
    '#    3   3',
    '#   4     4',
    '#  5       5',
    '#',
    '# Regeln:',
    '# - Keine Tabs, nur Leerzeichen.',
    '# - Kein print-Missbrauch.',
    '# - Genau diese Formatierung. Kein \\n extra.'
  ].join('\n');

  let workspaceFolders = vscode.workspace.workspaceFolders;

  // 🔁 Wenn kein Workspace aktiv → Benutzer nach Ordner fragen und VS Code neu starten
  if (!workspaceFolders || workspaceFolders.length === 0) {
    const pickedFolder = await vscode.window.showOpenDialog({
      canSelectFolders: true,
      openLabel: 'Challenge-Ordner auswählen',
      canSelectFiles: false,
      canSelectMany: false,
    });

    if (!pickedFolder || pickedFolder.length === 0) {
      vscode.window.showWarningMessage('⚠️ Kein Ordner ausgewählt. Challenge wird nicht erstellt.');
      return;
    }

    await vscode.commands.executeCommand('vscode.openFolder', pickedFolder[0], false);
    return;
  }

  const folderPath = workspaceFolders[0].uri.fsPath;

  const now = new Date();
  const day = now.getDate().toString().padStart(2, '0');
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const year = now.getFullYear().toString().slice(-2);
  const hour = now.getHours().toString().padStart(2, '0');
  const minute = now.getMinutes().toString().padStart(2, '0');
  const filename = `challenge_${day}_${month}_${year}_${hour}_${minute}.py`;


  const filePath = path.join(folderPath, filename);

  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, `${challenge}\n\n`, 'utf8');
    const doc = await vscode.workspace.openTextDocument(filePath);
    await vscode.window.showTextDocument(doc);
  }

  function runPythonCode(code: string, callback: (result: string) => void) {
    const tempFile = tmp.fileSync({ postfix: '.py' });
    fs.writeFileSync(tempFile.name, code.trim());

    exec(`python3 "${tempFile.name}"`, (error, stdout, stderr) => {
      if (error) {
        console.error('❌ Python Fehler:', stderr);
        callback('error');
      } else {
        callback(stdout);
      }
      tempFile.removeCallback();
    });
  }

  function visualize(line: string): string {
    return line.replace(/ /g, '␣').replace(/\n/g, '\\n');
  }

  const disposable = vscode.commands.registerCommand('extension.checkChallenge', () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;

    const code = editor.document.getText();

    runPythonCode(code, async (rawOutput) => {
      if (rawOutput === 'error') {
        vscode.window.showErrorMessage('⚠️ Fehler beim Ausführen des Codes. Denk an Einrückung und Format.');
        await fetch(apiUrl, {
          method: "POST", 
        });
        return;
      }

      const actualLines = rawOutput.replace(/\r\n/g, '\n').trimEnd().split('\n');
      const expectedLines = expectedOutput.split('\n');

      const allMatch = actualLines.length === expectedLines.length &&
        actualLines.every((line, i) => line === expectedLines[i]);

      if (allMatch) {
        vscode.window.showInformationMessage('✅ Challenge bestanden! Alles perfekt.');
      } else {
        await fetch(apiUrl, {
          method: "POST", 
        });
        vscode.window.showErrorMessage('❌ Deine Ausgabe stimmt nicht exakt. Details im Output-Panel.');

        const output = vscode.window.createOutputChannel('Challenge Checker');
        output.clear();
        output.appendLine('❌ Die Ausgabe stimmt nicht exakt.\n');
        output.appendLine('🔎 Erwartet (␣ = Leerzeichen):\n');
        expectedLines.forEach(l => output.appendLine(visualize(l)));
        output.appendLine('\n📤 Dein Output (␣ = Leerzeichen):\n');
        actualLines.forEach(l => output.appendLine(visualize(l)));
        output.appendLine('\n💡 Tipp: Achte auf exakte Anzahl von Leerzeichen und Zeilenumbrüchen.');
        output.show(true);
      }
    });
  });

  context.subscriptions.push(disposable);

  vscode.workspace.onDidSaveTextDocument((document) => {
    if (document.fileName.endsWith('.py')) {
      vscode.commands.executeCommand('extension.checkChallenge');
    }
  });
}



/*
for i in range(1, 6):
    spaces = 5 - i  
    if i == 1:
        print(' ' * spaces + str(i))
    else:
        print(' ' * spaces + str(i) + ' ' * (2 * i - 3) + str(i))
 */