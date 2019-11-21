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

import { injectable, inject } from 'inversify';
import { WidgetFactory } from '@theia/core/lib/browser/widget-manager';
import { VSCodeExtensionUri } from './vscode-extension-open-handler';
import { FrontendApplication } from '@theia/core/lib/browser';
import { VSCodeExtensionDetailWidget } from './vscode-extensions-detail-widget';
import { VSCodeExtension } from '../../vscode-extensions-types';

export interface VSCodeExtensionDetailWidgetOptions {
    readonly extension: VSCodeExtension;
    readonly readMe: string;
}

@injectable()
export class VSCodeExtensionDetailWidgetFactory implements WidgetFactory {

    readonly id = VSCodeExtensionUri.scheme;

    constructor(
        @inject(FrontendApplication) protected readonly app: FrontendApplication
    ) { }

    async createWidget(options: VSCodeExtensionDetailWidgetOptions): Promise<VSCodeExtensionDetailWidget> {
        const widget = new VSCodeExtensionDetailWidget(options);
        widget.id = 'vscode-extension:' + options.extension.name;
        widget.title.closable = true;
        widget.title.label = options.extension.name;
        widget.title.iconClass = 'fa fa-puzzle-piece';
        return widget;
    }

}
