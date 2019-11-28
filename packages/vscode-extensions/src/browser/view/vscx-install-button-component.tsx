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
import { VSCodeExtension } from '../vscode-extensions-types';

export class VSCXInstallButton extends React.Component<VSCXInstallButton.Props, VSCXInstallButton.States> {
    render(): JSX.Element {
        return <div className='extensionButtonContainer'>
            <div className='extensionButtonRow'>
                {this.createButtons(this.props.extension)}
            </div>
        </div>;
    }

    protected readonly install = () => this.props.onInstallButtonClicked();
    protected readonly uninstall = () => this.props.onUninstallButtonClicked();

    protected createButtons(extension: VSCodeExtension): React.ReactNode[] {
        const buttonArr: React.ReactNode[] = [];
        let btnLabel = 'Install';
        if (extension.installed) {
            btnLabel = 'Uninstall';
        }

        const faEl = <i className='fa fa-spinner fa-pulse fa-fw'></i>;
        const content = extension.busy ? faEl : btnLabel;
        buttonArr.push(<div
            key={'extensionDetailBtn' + btnLabel}
            className={'theia-button extensionButton' +
                (extension.busy ? ' working' : '') + ' ' +
                (extension.installed && !extension.busy ? ' installed' : '') + ' ' +
                (extension.outdated && !extension.busy ? ' outdated' : '')}
            onClick={event => {
                if (!extension.busy) {
                    if (extension.installed) {
                        this.uninstall();
                    } else {
                        this.install();
                    }
                    event.stopPropagation();
                }
            }}
        >{content}</div>);

        // if (extension.outdated) {
        //     buttonArr.push(<div className={(extension.busy ? ' working' : '') + ' ' +
        //                          'theia-button extensionButton' + (extension.outdated && !extension.busy ? ' outdated' : '')}
        //         onClick={event => {
        //             if (!extension.busy) {
        //                 extension.update();
        //             }
        //         }}>{extension.busy ? faEl : 'Update'}</div>);
        // }
        return buttonArr;
    }
}

export namespace VSCXInstallButton {
    export interface Props {
        extension: VSCodeExtension,
        onInstallButtonClicked: () => void,
        onUninstallButtonClicked: () => void
    }

    export interface States {

    }
}
