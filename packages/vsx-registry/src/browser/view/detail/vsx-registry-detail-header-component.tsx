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
import { VSCodeExtensionPartResolved, VSCodeExtensionFullResolved } from '../../vsx-registry-types';
import { VSCodeExtensionStars } from './vsx-registry-stars-component';
import { VSXRegistryInstallButton } from '../vsx-registry-install-button-component';
import { VSXRegistryService } from '../../vsx-registry-service';
import { ProgressService, DisposableCollection } from '@theia/core/lib/common';
import { ProgressLocationService } from '@theia/core/lib/browser/progress-location-service';
import { ProgressBar } from '@theia/core/lib/browser/progress-bar';

export class VSXRegistryDetailHeader extends React.Component<VSXRegistryDetailHeader.Props, VSXRegistryDetailHeader.State> {

    protected detailHeaderRef: (ref: HTMLElement | null) => void;
    protected progressLocation: string;

    constructor(props: VSXRegistryDetailHeader.Props) {
        super(props);

        this.progressLocation = this.props.id;

        this.detailHeaderRef = ref => {
            if (ref) {
                const onProgress = this.props.progressLocationService.onProgress(this.progressLocation);
                this.props.toDispose.push(new ProgressBar({ container: ref, insertMode: 'prepend' }, onProgress));
            }
        };
    }

    render(): JSX.Element {
        const extension = this.props.extension as VSCodeExtensionFullResolved;
        return <React.Fragment>
            <div ref={this.detailHeaderRef}>
                <div className='extension-header-container'>
                    {
                        extension.iconUrl ?
                            <div className='extension-header-image'>
                                <div className='icon'>
                                    <img src={extension.iconUrl} />
                                </div>
                            </div> : ''
                    }
                    <div className='extensionMetaDataContainer'>
                        <div className='extension-title-container'>
                            <h1 className='extension-name'>{extension.name}</h1>
                            <div className='extension-subtitle'>
                                <div className='extension-author'>{extension.publisher}</div>
                                <span className='text-divider' />
                                <div className='extension-version'>{extension.version}</div>
                                {
                                    extension.averageRating ?
                                        <React.Fragment>
                                            <span className='text-divider' />
                                            <div className='extension-rating-stars'>
                                                <VSCodeExtensionStars number={extension.averageRating} />
                                            </div>
                                        </React.Fragment>
                                        : ''
                                }
                                {
                                    extension.repository ?
                                        <React.Fragment>
                                            <span className='text-divider' />
                                            <a href={extension.repository} target='_blank'>Repository</a>
                                        </React.Fragment>
                                        : ''
                                }
                                {
                                    extension.license ?
                                        <React.Fragment>
                                            <span className='text-divider' />
                                            {extension.license}
                                        </React.Fragment>
                                        : ''
                                }
                            </div>
                        </div>
                        <div className='extension-description'>{extension.description}</div>
                        <VSXRegistryInstallButton
                            extension={extension}
                            service={this.props.service}
                            progressService={this.props.progressService} progressLocation={this.progressLocation} />
                    </div>
                </div>
            </div>
        </React.Fragment>;
    }
}

export namespace VSXRegistryDetailHeader {
    export interface Props {
        id: string;
        toDispose: DisposableCollection;
        extension: VSCodeExtensionPartResolved;
        service: VSXRegistryService;
        progressService: ProgressService;
        progressLocationService: ProgressLocationService;
    }
    export interface State {

    }
}
