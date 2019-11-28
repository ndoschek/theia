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
import { VSCodeExtensionPartResolved, VSCodeExtensionFullResolved } from '../../vscode-extensions-types';
import { VSCXStars } from './vscx-stars-component';
import { VSCXInstallButton } from '../vscx-install-button-component';
import { VSCodeExtensionsService } from '../../vscode-extensions-service';

export class VSCXDetailHeader extends React.Component<VSCXDetailHeader.Props, VSCXDetailHeader.State> {

    constructor(props: VSCXDetailHeader.Props) {
        super(props);
    }

    render(): JSX.Element {
        const extension = this.props.extension as VSCodeExtensionFullResolved;
        return <React.Fragment>
            <div className='extensionHeaderContainer'>
                {
                    extension.iconUrl ?
                        <div className='extensionHeaderImage'>
                            <div className='icon'>
                                <img src={extension.iconUrl} />
                            </div>
                        </div> : ''
                }
                <div className='extensionMetaDataContainer'>
                    <div className='extensionTitleContainer'>
                        <h1 className='extensionName'>{extension.name}</h1>
                        <div className='extensionSubtitle'>
                            <div className='extensionAuthor'>{extension.publisher}</div>
                            <span className='textDivider' />
                            <div className='extensionVersion'>{extension.version}</div>
                            {
                                extension.averageRating ?
                                    <React.Fragment>
                                        <span className='textDivider' />
                                        <div className='extensionRatingStars'>
                                            <VSCXStars number={extension.averageRating} />
                                        </div>
                                    </React.Fragment>
                                    : ''
                            }
                            {
                                extension.repository ?
                                    <React.Fragment>
                                        <span className='textDivider' />
                                        <a href={extension.repository} target='_blank'>Repository</a>
                                    </React.Fragment>
                                    : ''
                            }
                            {
                                extension.license ?
                                    <React.Fragment>
                                        <span className='textDivider' />
                                        {extension.license}
                                    </React.Fragment>
                                    : ''
                            }
                        </div>
                    </div>
                    <div className='extensionDescription'>{extension.description}</div>
                    <VSCXInstallButton
                        service={this.props.service}
                        extension={this.props.extension} />
                </div>
            </div>
        </React.Fragment>;
    }
}

export namespace VSCXDetailHeader {
    export interface Props {
        extension: VSCodeExtensionPartResolved
        service: VSCodeExtensionsService
    }
    export interface State {

    }
}
