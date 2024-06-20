/* eslint-disable @typescript-eslint/no-explicit-any */
/*
 * SPDX-FileCopyrightText: The Microsoft Corporation
 *
 * SPDX-License-Identifier: MIT
 */

import vscode = require('vscode');

let workspaceState: vscode.Memento;

export function getFromWorkspaceState(key: string, defaultValue?: any) {
    if (!workspaceState) {
        return defaultValue;
    }
    return workspaceState.get(key, defaultValue);
}

export function updateWorkspaceState(key: string, value: any) {
    if (!workspaceState) {
        return Promise.resolve();
    }
    return workspaceState.update(key, value);
}

export function setWorkspaceState(state: vscode.Memento) {
    workspaceState = state;
}

export function getWorkspaceState(): vscode.Memento {
    return workspaceState;
}

export function resetWorkspaceState() {
    return resetStateQuickPick(workspaceState, updateWorkspaceState);
}

export function getMementoKeys(state: vscode.Memento): string[] {
    if (!state) {
        return [];
    }
    // tslint:disable-next-line: no-empty
    if ((state as any)._value) {
        const keys = Object.keys((state as any)._value);
        // Filter out keys with undefined values, so they are not shown
        // in the quick pick menu.
        return keys.filter((key) => state.get(key) !== undefined);
    }
    return [];
}

async function resetStateQuickPick(state: vscode.Memento, updateFn: (key: string, value: any) => {}) {
    const items = await vscode.window.showQuickPick(getMementoKeys(state), {
        canPickMany: true,
        placeHolder: 'Select the keys to reset.'
    });
    resetItemsState(items!, updateFn);
}

export function resetItemsState(items: string[], updateFn: (key: string, value: any) => {}) {
    if (!items) {
        return;
    }
    items.forEach((item) => updateFn(item, undefined));
}
