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
import { VSCXListItem } from './vscx-list-item-component';

export class VSCXList extends React.Component<VSCXList.Props> {

    protected readonly onItemClicked = (extensionRaw: VSCodeExtensionRaw) => this.props.onItemClicked(extensionRaw);

    render(): JSX.Element {
        return <React.Fragment>
            {
                this.props.extensions && this.props.extensions.length > 0 ?
                    this.props.extensions.map(extension =>
                        <VSCXListItem onClick={this.onItemClicked} key={extension.publisher + extension.name} extension={extension} />)
                    :
                    <div className='extensionHeaderContainer'>
                        No Extensions Found
                    </div>
            }
        </React.Fragment>;
    }
}

export namespace VSCXList {
    export interface Props {
        extensions?: VSCodeExtensionRaw[];
        onItemClicked: (extension: VSCodeExtensionRaw) => void;
    }
}
