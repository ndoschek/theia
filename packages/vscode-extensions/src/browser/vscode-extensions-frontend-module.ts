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

import { ContainerModule } from 'inversify';
import { WidgetFactory, bindViewContribution, FrontendApplicationContribution, ViewContainerIdentifier, OpenHandler } from '@theia/core/lib/browser';
import { VSCodeExtensionsWidget, VSCXInstalledList, VSCXList } from './view/list/vscode-extensions-widget';
import { VSCodeExtensionsContribution } from './vscode-extensions-contribution';
import { VSCodeExtensionsSearchbarWidget } from './view/list/vscode-extensions-searchbar-widget';
import { VSCodeExtensionsListWidget } from './view/list/vscode-extensions-list-widget';
import { VSCodeExtensionsAPI } from './vscode-extensions-api';
import { VSCodeExtensionsService } from './vscode-extensions-service';
import { VSCodeExtensionsModel } from './vscode-extensions-model';

import '../../src/browser/style/index.css';
import { VSCodeExtensionOpenHandler } from './view/detail/vscode-extension-open-handler';
import { VSCodeExtensionDetailWidgetFactory } from './view/detail/vscode-extension-detail-widget-factory';

export default new ContainerModule(bind => {
    bindViewContribution(bind, VSCodeExtensionsContribution);
    bind(FrontendApplicationContribution).toService(VSCodeExtensionsContribution);

    bind(VSCodeExtensionsSearchbarWidget).toSelf().inSingletonScope();
    bind(VSCodeExtensionsService).toSelf().inSingletonScope();
    bind(VSCodeExtensionsModel).toSelf().inSingletonScope();
    bind(VSCodeExtensionsAPI).toSelf().inSingletonScope();

    bind(VSCXInstalledList).toDynamicValue(({ container }) =>
        VSCodeExtensionsListWidget.createWidget(container, { id: 'installed_extension_list', label: 'Open VSX Registry' }));
    bind(VSCXList).toDynamicValue(({ container }) =>
        VSCodeExtensionsListWidget.createWidget(container, { id: 'extension_list', label: 'Extensions' }));

    bind(WidgetFactory).toDynamicValue(ctx => ({
        id: VSCodeExtensionsWidget.ID,
        createWidget: async () => {
            const container = ctx.container.createChild();
            container.bind(ViewContainerIdentifier).toConstantValue({ id: VSCodeExtensionsWidget.ID });
            container.bind(VSCodeExtensionsWidget).toSelf().inSingletonScope();
            return container.get(VSCodeExtensionsWidget);
        }
    })).inSingletonScope();

    bind(VSCodeExtensionDetailWidgetFactory).toSelf().inSingletonScope();
    bind(WidgetFactory).toService(VSCodeExtensionDetailWidgetFactory);

    bind(VSCodeExtensionOpenHandler).toSelf().inSingletonScope();
    bind(OpenHandler).toService(VSCodeExtensionOpenHandler);
});
