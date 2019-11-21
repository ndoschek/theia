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
 import { VSCodeExtensionsService } from '../../vscode-extensions-service';
 import { VSCodeExtensionsModel } from '../../vscode-extensions-model';
import { VSCXListItem } from './vscx-list-item-component';

 export class VSCXList extends React.Component<VSCXList.Props, VSCXList.State> {

    constructor(props: VSCXList.Props) {
        super(props);

        this.props.model.onExtensionsChanged(() => {
            this.updateExtensions();
        });

        this.state = {
            extensions: []
        };
    }

    componentDidMount(): void {
        this.updateExtensions();
    }

    protected async updateExtensions(): Promise<void> {
        const extensions = this.props.model.extensions;
        this.setState({ extensions });
    }

    render(): JSX.Element {
        return <React.Fragment>
            {
                this.state.extensions.map(extension => <VSCXListItem service={this.props.service} key={extension.publisher + extension.name} extension={extension} />)
            }
        </React.Fragment>;
    }
}

export namespace VSCXList {
    export interface Props {
        model: VSCodeExtensionsModel,
        service: VSCodeExtensionsService
    }

    export interface State {
        extensions: VSCodeExtensionRaw[]
    }
}
