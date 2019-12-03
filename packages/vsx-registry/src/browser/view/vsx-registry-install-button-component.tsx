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
import { VSCodeExtensionPartResolved } from '../vsx-registry-types';
import { VSXRegistryService } from '../vsx-registry-service';
import { ProgressService } from '@theia/core/lib/common';

export class VSXRegistryInstallButton extends React.Component<VSXRegistryInstallButton.Props, VSXRegistryInstallButton.States> {

    constructor(props: VSXRegistryInstallButton.Props) {
        super(props);

        this.state = {
            busy: false
        };
    }

    render(): JSX.Element {
        return <div className='extension-button-container'>
            <div className='extension-button-row'>
                {this.createButtons(this.props.extension as VSCodeExtensionPartResolved)}
            </div>
        </div>;
    }

    protected readonly onInstallButtonClicked = async (kind: 'install' | 'uninstall') => {
        this.setState({ busy: true });
        const progress = await this.props.progressService.showProgress({
            text: `${kind}ing ${this.props.extension.displayName || this.props.extension.name}`,
            options: {
                location: this.props.progressLocation
            }
        });
        await this.props.service[kind](this.props.extension);
        progress.cancel();
        this.setState({ busy: false });
    }

    protected createButtons(extension: VSCodeExtensionPartResolved): React.ReactNode[] {
        const buttonArr: React.ReactNode[] = [];
        let btnLabel = 'Install';
        if (extension.installed) {
            btnLabel = 'Uninstall';
        }
        if (extension.installed && this.state.busy) {
            btnLabel = 'Uninstalling';
        } else if (!extension.installed && this.state.busy) {
            btnLabel = 'Installing';
        }

        buttonArr.push(<div
            key={'extensionDetailBtn' + btnLabel}
            className={'theia-button extension-button' +
                (this.state.busy ? ' working' : '') + ' ' +
                (extension.installed && !this.state.busy ? ' installed' : '') + ' ' +
                (extension.outdated && !this.state.busy ? ' outdated' : '')}
            onClick={event => {
                if (!this.state.busy) {
                    this.onInstallButtonClicked(extension.installed ? 'uninstall' : 'install');
                    event.stopPropagation();
                }
            }}
        >{btnLabel}</div>);
        return buttonArr;
    }
}

export namespace VSXRegistryInstallButton {
    export interface Props {
        extension: VSCodeExtensionPartResolved,
        service: VSXRegistryService,
        progressService: ProgressService,
        progressLocation: string
    }

    export interface States {
        busy: boolean;
    }
}
