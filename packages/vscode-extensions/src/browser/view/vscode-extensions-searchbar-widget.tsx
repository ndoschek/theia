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
import { ReactWidget } from '@theia/core/lib/browser/widgets';
import { injectable, postConstruct, inject } from 'inversify';
import { DisposableCollection, Disposable } from '@theia/core/lib/common';
import { VSCodeExtensionsService } from '../vscode-extensions-service';

@injectable()
export class VSCodeExtensionsSearchbarWidget extends ReactWidget {

    @inject(VSCodeExtensionsService) protected readonly service: VSCodeExtensionsService;

    protected readonly toDisposeOnSearch = new DisposableCollection();

    @postConstruct()
    protected init(): void {
        this.id = 'vscode-extension-searchbar';

        this.update();
    }

    protected onChange = (query: string) => {
        this.toDisposeOnSearch.dispose();
        const delay = setTimeout(() => this.service.updateSearch({ query }));
        this.toDisposeOnSearch.push(Disposable.create(() => clearTimeout(delay)));
        this.toDispose.push(this.toDisposeOnSearch);
    }

    protected render(): React.ReactNode {
        return <VSCodeExtensionSearchComponent onChange={this.onChange} />;
    }
}

export class VSCodeExtensionSearchComponent extends React.Component<VSCodeExtensionSearchComponent.Props, VSCodeExtensionSearchComponent.State> {

    constructor(props: VSCodeExtensionSearchComponent.Props) {
        super(props);

        this.state = {
            query: ''
        };
    }

    componentDidUpdate(): void {
        this.props.onChange(this.state.query);
    }

    protected searchFieldKeyUp = (ev: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({ query: ev.target.value });
    }

    render(): JSX.Element {
        return <React.Fragment>
            <div id='extensionSearchContainer' className='flexcontainer'>
                <div id='extensionSearchFieldContainer' className='flexcontainer'>
                    <input
                        id='extensionSearchField'
                        type='text'
                        value={this.state.query}
                        placeholder='Search in Open VSCode Registry'
                        onChange={this.searchFieldKeyUp}>
                    </input >
                </div>
            </div>
        </React.Fragment>;
    }
}

export namespace VSCodeExtensionSearchComponent {
    export interface Props {
        onChange: (query: string) => void
    }

    export interface State {
        query: string
    }
}
