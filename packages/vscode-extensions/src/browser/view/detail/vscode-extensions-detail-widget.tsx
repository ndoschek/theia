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

import * as React from 'react';
import { ReactWidget } from '@theia/core/lib/browser';
import { VSCodeExtensionDetailWidgetOptions } from './vscode-extension-detail-widget-factory';
import { VSCXDetailHeader } from './vscx-detail-header-component';
import { VSCodeExtension } from '../../vscode-extensions-types';
import { VSCodeExtensionsService } from '../../vscode-extensions-service';
import { VSCodeExtensionsModel } from '../../vscode-extensions-model';

export class VSCodeExtensionDetailWidget extends ReactWidget {

    constructor(
        protected readonly options: VSCodeExtensionDetailWidgetOptions,
        protected readonly service: VSCodeExtensionsService,
        protected readonly model: VSCodeExtensionsModel
    ) {
        super();
        this.addClass('vscode-extension-detail');
        service.onDidUpdateInstalled(() => {
            this.init();
        });
        this.init();
    }

    protected init(): void {
        const installed = !!this.model.getExtensionsByLocation('installed')
            .find(ext => this.options.extension.publisher === ext.publisher && this.options.extension.name === ext.name);
        if (installed) {
            this.options.extension.installed = true;
        }
        this.options.extension.busy = false;
        this.update();
    }

    protected readonly onInstallButtonClicked = async (extension: VSCodeExtension) => {
        this.options.extension.busy = true;
        this.service.install(extension);
        this.update();
    }
    protected readonly onUninstallButtonClicked = async (extension: VSCodeExtension) => {
        this.options.extension.busy = true;
        this.service.uninstall(extension);
        this.update();
    }

    protected render(): React.ReactNode {
        return <React.Fragment>
            <VSCXDetailHeader extension={this.options.extension} onUninstallButtonClicked={this.onUninstallButtonClicked} onInstallButtonClicked={this.onInstallButtonClicked} />
            <div className='extensionDocContainer flexcontainer'>
                <div className='extensionDocumentation'>
                    <span dangerouslySetInnerHTML={{ __html: this.options.readMe }} />
                </div>
            </div>
        </React.Fragment>;
    }

}
