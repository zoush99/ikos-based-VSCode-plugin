// Copyright (c) 2024 zoush99
//
// SPDX-License-Identifier: MIT

import { ikosSeverityMaps, Settings, VS_DiagnosticSeverity } from '../settings';
import { Linter } from './linter';
import { InternalDiagnostic } from '../server';
import { path as sysPath } from '../utils';
import { DiagnosticSeverity } from 'vscode-languageserver/node';

export class ikos extends Linter {
    constructor(settings: Settings, workspaceRoot: string) {
        super('ikos', settings, workspaceRoot, false);
        this.cascadeCommonSettings('ikos');

        this.setExecutable(settings.ikos.executable);
        this.active = this.enabled = settings.ikos.enable;
    }

    protected buildCommandLine(fileName: string, _tmpFileName: string): string[] {
        let args = [this.executable].concat([]);    // TODO

        args.push(sysPath(fileName));

        return args;
    }

    protected parseLine(line: string): InternalDiagnostic | null {

        let regex = /^([^:]+):(\d+):(\d+):\s*(error|warning|info|note):\s*(.+)$/;
        
        let regexArray: RegExpExecArray | null;

        if ((regexArray = regex.exec(line)) !== null) {
            return {
                fileName: regexArray[1],
                line: parseInt(regexArray[2],10),
                column: parseInt(regexArray[3],10) || 0,
                severity: this.getSeverityCode(regexArray[4]),
                code:0, // TODO
                message: regexArray[5],
                source: 'ikos',
            };
        } else {
            return {
                parseError: 'Line could not be parsed: ' + line,
                fileName: '',
                line: 0,
                column: 0,
                severity: DiagnosticSeverity.Error,
                code: 0,
                message: '',
                source: 'ikos'
            };
        }
    }

    private getSeverityCode(severity: string): DiagnosticSeverity {
        let output = this.settings.ikos.severityLevels[severity as keyof ikosSeverityMaps];
        return VS_DiagnosticSeverity.from(output);
    }
}
