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
 import { VSCodeExtensionRaw } from '../../vscode-extensions-types';

 export class VSCXListItem extends React.Component<VSCXListItem.Props, VSCXListItem.State> {

    protected readonly extensionClick = () => {
        this.props.onClick(this.props.extension);
    }

    render(): JSX.Element {
        const { extension } = this.props;
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
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </React.Fragment>;
    }
}

export namespace VSCXListItem {
    export interface Props {
        extension: VSCodeExtensionRaw,
        onClick: (extension: VSCodeExtensionRaw) => void
    }
    export interface State {

    }
}
