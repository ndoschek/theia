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
import { VSCodeExtensionPart } from '../../vscode-extensions-types';
import { VSCXListItem } from './vscx-list-item-component';
import { VSCodeExtensionsService } from '../../vscode-extensions-service';
import { VSCodeExtensionsModel } from '../../vscode-extensions-model';

export class VSCXList extends React.Component<VSCXList.Props> {

    render(): JSX.Element {
        return <React.Fragment>
            {
                this.props.extensions && this.props.extensions.length > 0 ?
                    this.props.extensions.map(extension =>
                        <VSCXListItem key={extension.publisher + extension.name} model={this.props.model} service={this.props.service} extension={extension} />)
                    :
                    <div className='extensionHeaderContainer noExtensionFound'>
                        No Extensions Found
                    </div>
            }
        </React.Fragment>;
    }
}

export namespace VSCXList {
    export interface Props {
        extensions?: VSCodeExtensionPart[];
        service: VSCodeExtensionsService;
        model: VSCodeExtensionsModel;
    }
}
