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

export class VSCodeExtensionDetailWidget extends ReactWidget {

    constructor(protected readonly options: VSCodeExtensionDetailWidgetOptions, protected readonly service: VSCodeExtensionsService) {
        super();

        this.addClass('vscode-extension-detail');

        this.update();
    }

    protected readonly onInstallButtonClicked = (extension: VSCodeExtension) => {
        this.service.install(extension);
    }

    protected render(): React.ReactNode {
        return <React.Fragment>
            <VSCXDetailHeader extension={this.options.extension} onInstallButtonClicked={this.onInstallButtonClicked} />
            <div className='extensionDocContainer flexcontainer'>
                <div className='extensionDocumentation'>
                    <span dangerouslySetInnerHTML={{ __html: this.options.readMe }} />
                </div>
            </div>
        </React.Fragment>;
    }

}
