import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import * as tmp from 'tmp';

const apiUrl = "http://192.168.166.203:5000/error";

interface Challenge {
  description: string;
  expectedOutput: string;
}

const challenges: Challenge[] = [
  {
    description: [
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
    ].join('\n'),
    expectedOutput: [
      '    1',
      '   2 2',
      '  3   3',
      ' 4     4',
      '5       5'
    ].join('\n')
  },
  {
    description: [
      '# Aufgabe: Gib exakt folgenden Output aus:',
      '#',
      '# 0',
      '# 1 2',
      '# 3 4 5',
      '# 6 7 8 9',
      '#',
      '# Hinweis: Fortlaufende Zahlen, eine Zeile mehr pro Level.'
    ].join('\n'),
    expectedOutput: [
      '0',
      '1 2',
      '3 4 5',
      '6 7 8 9'
    ].join('\n')
  },
  {
    description: [
      '# Aufgabe: Gib exakt folgenden Output aus:',
      '#',
      '# A',
      '# B B',
      '# C   C',
      '# D     D',
      '#',
      '# Hinweis: Nur Buchstaben, auf Abstand achten.'
    ].join('\n'),
    expectedOutput: [
      'A',
      'B B',
      'C   C',
      'D     D'
    ].join('\n')
  }
];

export async function activate(context: vscode.ExtensionContext) {
  console.log('⚡ Extension aktiviert');

  const challenge = challenges[Math.floor(Math.random() * challenges.length)];
  const expectedOutput = challenge.expectedOutput;

  let workspaceFolders = vscode.workspace.workspaceFolders;
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
    fs.writeFileSync(filePath, `${challenge.description}\n\n`, 'utf8');
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
        await fetch(apiUrl, { method: 'POST' });
        return;
      }

      const actualLines = rawOutput.replace(/\r\n/g, '\n').trimEnd().split('\n');
      const expectedLines = expectedOutput.split('\n');

      const allMatch = actualLines.length === expectedLines.length &&
        actualLines.every((line, i) => line === expectedLines[i]);

      if (allMatch) {
        vscode.window.showInformationMessage('✅ Challenge bestanden! Alles perfekt.');
      } else {
        await fetch(apiUrl, { method: 'POST' });
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
