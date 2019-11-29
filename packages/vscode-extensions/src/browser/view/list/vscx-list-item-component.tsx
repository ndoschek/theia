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
import { VSCodeExtensionPartResolved, VSCodeExtensionPart } from '../../vscode-extensions-types';
import { VSCXInstallButton } from '../vscx-install-button-component';
import { VSCodeExtensionsService } from '../../vscode-extensions-service';
import { VSCodeExtensionsModel } from '../../vscode-extensions-model';
import { ProgressService } from '@theia/core/lib/common';

export class VSCXListItem extends React.Component<VSCXListItem.Props, VSCXListItem.State> {
    protected headerContainer: HTMLElement | null;
    protected readonly extensionClick = () => this.props.service.openExtensionDetail(this.props.extension);

    constructor(props: VSCXListItem.Props) {
        super(props);
    }

    render(): JSX.Element {
        const { extension, service, model, progressService, progressLocation } = this.props;
        const extensionResolved = new VSCodeExtensionPartResolved(extension, model);
        const tooltip = extension.description;
        const icon = extension.iconUrl;
        return <React.Fragment>
            <div key={extension.name} onClick={this.extensionClick} className='extensionHeaderContainer' title={tooltip}>
                <div className='flexcontainer row'>
                {
                    icon ?
                        <div className='extensionIconContainer'>
                            <div className='icon'>
                                <img src={icon} />
                            </div>
                        </div> : ''
                }
                <div className='extensionInformationContainer'>
                    <div className={'column flexcontainer'}>
                        <div className='row flexcontainer'>
                            <div className='extensionName noWrapInfo'>{extension.displayName || extension.name}</div>
                            <div className='extensionVersion'>{extension.version}</div>
                        </div>
                        <div className='row flexcontainer'>
                            <div className='extensionDescription noWrapInfo'>{extension.description}</div>
                        </div>
                        <div className='row flexcontainer'>
                            <div className='extensionAuthor noWrapInfo flexcontainer'>{extension.publisher}</div>
                            <VSCXInstallButton
                                progressLocation={progressLocation}
                                progressService={progressService}
                                service={service}
                                extension={extensionResolved} />
                        </div>
                    </div>
                </div>
            </div>
            </div>
        </React.Fragment >;
    }
}

export namespace VSCXListItem {
    export interface Props {
        service: VSCodeExtensionsService,
        model: VSCodeExtensionsModel,
        extension: VSCodeExtensionPart,
        progressService: ProgressService,
        progressLocation: string
    }
    export interface State {

    }
}
