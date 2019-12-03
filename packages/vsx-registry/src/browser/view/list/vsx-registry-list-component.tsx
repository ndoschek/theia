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
import { VSCodeExtensionPart } from '../../vsx-registry-types';
import { VSXRegistryListItem } from './vsx-registry-list-item-component';
import { VSXRegistryService } from '../../vsx-registry-service';
import { VSXRegistryModel } from '../../vsx-registry-model';
import { ProgressService } from '@theia/core/lib/common';

export class VSXRegistryList extends React.Component<VSXRegistryList.Props> {

    render(): JSX.Element {
        return <React.Fragment>
            {
                this.props.extensions && this.props.extensions.length > 0 ?
                    this.props.extensions.map(extension =>
                        <VSXRegistryListItem
                            progressLocation={this.props.progressLocation}
                            progressService={this.props.progressService}
                            key={extension.publisher + extension.name}
                            model={this.props.model}
                            service={this.props.service}
                            extension={extension}
                        />)
                    :
                    <div className='extension-header-container no-extension-found'>
                        No Extensions Found
                    </div>
            }
        </React.Fragment>;
    }
}

export namespace VSXRegistryList {
    export interface Props {
        extensions?: VSCodeExtensionPart[];
        service: VSXRegistryService;
        model: VSXRegistryModel;
        progressService: ProgressService,
        progressLocation: string
    }
}
