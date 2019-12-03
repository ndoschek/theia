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
import { VSXRegistrySearchbarWidget } from './vsx-registry-searchbar-widget';
import { VSXRegistryListWidget } from './vsx-registry-list-widget';
import { VSXRegistryService } from '../../vsx-registry-service';
import { VSCodeExtensionsCommands } from '../../vsx-registry-contribution';
import { ProgressBar } from '@theia/core/lib/browser/progress-bar';

export const VSXRegistryInstalledList = Symbol('VSXRegistryInstalledList');
export const VSXRegistryList = Symbol('VSXRegistryList');

@injectable()
export class VSXRegistryWidget extends ViewContainer {

    static ID = 'theia-vsx-registry';
    static LABEL = 'Extensions';

    protected progressLocation: string;

    @inject(VSXRegistrySearchbarWidget) protected readonly vscxSearchbar: VSXRegistrySearchbarWidget;
    @inject(VSXRegistryService) protected readonly service: VSXRegistryService;
    @inject(VSXRegistryInstalledList) protected readonly vscxInstalledList: VSXRegistryListWidget;
    @inject(VSXRegistryList) protected readonly vscxRegistryList: VSXRegistryListWidget;

    @postConstruct()
    protected init(): void {
        super.init();

        this.id = 'theia-vsx-registry';
        this.title.label = 'Extensions';
        this.title.caption = 'Extensions';
        this.title.iconClass = 'theia-vsx-registry-tab-icon';
        this.title.closable = true;

        this.addClass('theia-vsx-registry');
        this.addClass('extension-list');

        this.setTitleOptions({ label: VSXRegistryWidget.LABEL });

        this.addWidget(this.vscxInstalledList, { canHide: true });
        const installedListPart = this.getPartFor(this.vscxInstalledList);
        this.addWidget(this.vscxRegistryList, { canHide: true });
        const registryListPart = this.getPartFor(this.vscxRegistryList);
        if (registryListPart) {
            registryListPart.setHidden(true);
        }
        this.service.onDidUpdateSearch(() => {
            if (registryListPart && installedListPart) {
                const query = this.vscxSearchbar.getSearchTerm();
                if (!!query) {
                    registryListPart.setHidden(false);
                    installedListPart.setHidden(true);
                } else {
                    registryListPart.setHidden(true);
                    installedListPart.setHidden(false);
                }
            }
        });

        const onDidChange = this.service.onDidUpdateSearch;
        this.toolbarRegistry.registerItem({
            id: VSCodeExtensionsCommands.CLEAR_ALL.id,
            command: VSCodeExtensionsCommands.CLEAR_ALL.id,
            tooltip: VSCodeExtensionsCommands.CLEAR_ALL.label,
            priority: 1,
            onDidChange
        });

        this.progressLocation = 'vsx-registry-list';
        const onProgress = this.progressLocationService.onProgress(this.progressLocation);
        this.toDispose.push(new ProgressBar({ container: this.node, insertMode: 'prepend' }, onProgress));
    }

    getSearchTerm(): string {
        return this.vscxSearchbar.getSearchTerm();
    }

    clear(): void {
        this.vscxSearchbar.clear();
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
