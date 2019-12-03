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
import { VSXRegistryDetailHeader } from './vsx-registry-detail-header-component';
import { VSXRegistryService } from '../../vsx-registry-service';
import { VSXRegistryModel } from '../../vsx-registry-model';
import { ProgressService } from '@theia/core/lib/common';
import { ProgressLocationService } from '@theia/core/lib/browser/progress-location-service';
import { VSCodeExtensionFullResolved } from '../../vsx-registry-types';

export class VSXRegistryDetailWidget extends ReactWidget {

    constructor(
        protected readonly extension: VSCodeExtensionFullResolved,
        protected readonly readMe: string,
        protected readonly service: VSXRegistryService,
        protected readonly model: VSXRegistryModel,
        protected readonly progressService: ProgressService,
        protected readonly progressLocationService: ProgressLocationService
    ) {
        super();
        this.addClass('vscode-extension-detail');

        this.id = extension.publisher + '-' + extension.name + '-' + 'detail';

        service.onDidUpdateInstalled(() => {
            this.update();
        });
        this.update();
    }

    protected render(): React.ReactNode {
        return <React.Fragment>
            <VSXRegistryDetailHeader
                toDispose={this.toDispose}
                id={this.id}
                progressLocationService={this.progressLocationService}
                progressService={this.progressService}
                extension={this.extension}
                service={this.service} />
            <div className='extension-doc-container flexcontainer'>
                <div className='extension-documentation'>
                    <span dangerouslySetInnerHTML={{ __html: this.readMe }} />
                </div>
            </div>
        </React.Fragment>;
    }

}
