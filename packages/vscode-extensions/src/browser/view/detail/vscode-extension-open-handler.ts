/********************************************************************************
 * Copyright (C) 2019 TypeFox and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *
 * This Source Code may also be made available under the following Secondary
 * Licenses when the conditions for such availability set forth in the Eclipse
 * Public License v. 2.0 are satisfied: GNU General Public License, version 2
 * with the GNU Classpath Exception which is available at
 * https://www.gnu.org/software/classpath/license.html.
 *
 * SPDX-License-Identifier: EPL-2.0 OR GPL-2.0 WITH Classpath-exception-2.0
 ********************************************************************************/

import { injectable } from 'inversify';
import URI from '@theia/core/lib/common/uri';
import { WidgetOpenHandler, WidgetOpenerOptions } from '@theia/core/lib/browser';
import { VSCodeExtensionDetailWidget } from './vscode-extensions-detail-widget';
import { VSCodeExtensionDetailWidgetOptions } from './vscode-extension-detail-widget-factory';

export namespace VSCodeExtensionUri {
    export const scheme = 'vscode';
    export function toUri(extensionName: string): URI {
        return new URI('').withScheme(scheme).withPath('extension/' + extensionName);
    }
    export function toExtensionName(uri: URI): string {
        if (uri.scheme === scheme && uri.path.dir.toString() === 'extension') {
            return uri.path.base;
        }
        throw new Error('The given uri is not an vscode extension URI, uri: ' + uri);
    }
}

export type VSCodeExtensionDetailOpenerOptions = WidgetOpenerOptions & VSCodeExtensionDetailWidgetOptions;

@injectable()
export class VSCodeExtensionOpenHandler extends WidgetOpenHandler<VSCodeExtensionDetailWidget> {

    readonly id = VSCodeExtensionUri.scheme;

    canHandle(uri: URI): number {
        try {
            VSCodeExtensionUri.toExtensionName(uri);
            return 500;
        } catch {
            return 0;
        }
    }

    protected createWidgetOptions(uri: URI, options: VSCodeExtensionDetailOpenerOptions): VSCodeExtensionDetailWidgetOptions {
        return {
            url: options.url
        };
    }

}
