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

import { injectable, inject, postConstruct } from 'inversify';
import { ViewContainer, PanelLayout, SplitPanel, ViewContainerLayout, ViewContainerPart } from '@theia/core/lib/browser';
import { VSCodeExtensionsSearchbarWidget } from './vscode-extensions-searchbar-widget';
import { VSCodeExtensionsListWidget } from './vscode-extensions-list-widget';

export const VSCXInstalledList = Symbol('VSCXInstalledList');
export const VSCXList = Symbol('VSCXList');

@injectable()
export class VSCodeExtensionsWidget extends ViewContainer {

    static ID = 'vscode-extensions';
    static LABEL = 'Extensions';

    @inject(VSCodeExtensionsSearchbarWidget) protected readonly vscxSearchbar: VSCodeExtensionsSearchbarWidget;

    @inject(VSCXInstalledList) protected readonly vscxInstalledList: VSCodeExtensionsListWidget;
    @inject(VSCXList) protected readonly vscxList: VSCodeExtensionsListWidget;

    @postConstruct()
    protected init(): void {
        super.init();

        this.addClass('vscode-extensions');

        this.setTitleOptions({label: VSCodeExtensionsWidget.LABEL});

        this.addWidget(this.vscxInstalledList);
        this.addWidget(this.vscxList);
    }

    protected initLayout(): void {
        const layout = new PanelLayout();
        this.layout = layout;
        this.panel = new SplitPanel({
            layout: new ViewContainerLayout({
                renderer: SplitPanel.defaultRenderer,
                orientation: this.orientation,
                spacing: 2,
                headerSize: ViewContainerPart.HEADER_HEIGHT,
                animationDuration: 200
            }, this.splitPositionHandler)
        });
        this.panel.node.tabIndex = -1;
        layout.addWidget(this.vscxSearchbar);
        layout.addWidget(this.panel);
    }
}
