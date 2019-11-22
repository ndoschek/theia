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
import { VSCodeExtension } from '../../vscode-extensions-types';
import { VSCXStars } from './vscx-stars-component';
import { VSCXInstallButton } from '../vscx-install-button-component';

export class VSCXDetailHeader extends React.Component<VSCXDetailHeader.Props, VSCXDetailHeader.State> {

    constructor(props: VSCXDetailHeader.Props) {
        super(props);
    }

    protected readonly onInstallButtonClicked = () => this.props.onInstallButtonClicked(this.props.extension);

    render(): JSX.Element {
        return <React.Fragment>
            <div className='extensionHeaderContainer'>
                {
                    this.props.extension.iconUrl ?
                        <div className='extensionHeaderImage'>
                            <div className='icon'>
                                <img src={this.props.extension.iconUrl} />
                            </div>
                        </div> : ''
                }
                <div className='extensionMetaDataContainer'>
                    <div className='extensionTitleContainer'>
                        <h1 className='extensionName'>{this.props.extension.name}</h1>
                        <div className='extensionSubtitle'>
                            <div className='extensionAuthor'>{this.props.extension.publisher}</div>
                            <span className='textDivider' />
                            <div className='extensionVersion'>{this.props.extension.version}</div>
                            {
                                this.props.extension.averageRating ?
                                    <React.Fragment>
                                        <span className='textDivider' />
                                        <div className='extensionRatingStars'>
                                            <VSCXStars number={this.props.extension.averageRating} />
                                        </div>
                                    </React.Fragment>
                                    : ''
                            }
                            {
                                this.props.extension.repository ?
                                    <React.Fragment>
                                        <span className='textDivider' />
                                        <a href={this.props.extension.repository} target='_blank'>Repository</a>
                                    </React.Fragment>
                                    : ''
                            }
                            {
                                this.props.extension.license ?
                                    <React.Fragment>
                                        <span className='textDivider' />
                                        {this.props.extension.license}
                                    </React.Fragment>
                                    : ''
                            }
                        </div>
                    </div>
                    <div className='extensionDescription'>{this.props.extension.description}</div>
                    <VSCXInstallButton extension={this.props.extension} onInstallButtonClicked={this.onInstallButtonClicked} />
                </div>
            </div>
        </React.Fragment>;
    }
}

export namespace VSCXDetailHeader {
    export interface Props {
        extension: VSCodeExtension
        onInstallButtonClicked: (extension: VSCodeExtension) => void
    }
    export interface State {

    }
}
