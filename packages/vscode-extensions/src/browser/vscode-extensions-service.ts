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
import * as showdown from 'showdown';
import * as sanitize from 'sanitize-html';
import { DisposableCollection, Emitter } from '@theia/core';
import { VSCodeExtensionsAPI } from './vscode-extensions-api';
import { SearchParam, VSCodeExtensionPart, VSCodeExtensionFull, VSCodeExtensionReviewList, VSCodeExtensionPartResolved } from './vscode-extensions-types';
import { VSCodeExtensionsModel } from './vscode-extensions-model';
import { OpenerService, open } from '@theia/core/lib/browser';
import { VSCodeExtensionUri, VSCodeExtensionDetailOpenerOptions } from './view/detail/vscode-extension-open-handler';
import { PluginServer } from '@theia/plugin-ext';
import { HostedPluginSupport } from '@theia/plugin-ext/lib/hosted/browser/hosted-plugin';

export type ExtensionKeywords = string[];
export const ExtensionKeywords = Symbol('ExtensionKeyword');

// for now to test the extension one has to start the Registry Server via https://gitpod.io/#https://github.com/theia-ide/extension-registry
// and copy then the workspace url plus '/api' to here
export const API_URL = 'https://8080-c5484d3a-4b1a-4f66-81aa-c5fbc0d8ee0e.ws-eu01.gitpod-staging.com/api';

@injectable()
export class VSCodeExtensionsService {
    protected readonly toDispose = new DisposableCollection();

    protected readonly onDidUpdateSearchEmitter = new Emitter<void>();
    readonly onDidUpdateSearch = this.onDidUpdateSearchEmitter.event;

    protected readonly onDidUpdateInstalledEmitter = new Emitter<void>();
    readonly onDidUpdateInstalled = this.onDidUpdateInstalledEmitter.event;

    @inject(VSCodeExtensionsAPI) protected readonly api: VSCodeExtensionsAPI;
    @inject(VSCodeExtensionsModel) protected readonly model: VSCodeExtensionsModel;
    @inject(OpenerService) protected readonly openerService: OpenerService;
    @inject(HostedPluginSupport) protected readonly pluginSupport: HostedPluginSupport;
    @inject(PluginServer) protected readonly pluginServer: PluginServer;

    @postConstruct()
    protected async init(): Promise<void> {
        this.updateSearch();
        this.toDispose.push(this.pluginSupport.onDidChangePlugins(() => this.updateInstalled()));
    }

    protected createEndpoint(arr: string[], queries?: { key: string, value: string | number }[]): string {
        const url = '/' + arr.reduce((acc, curr) => acc + (curr ? '/' + curr : ''));
        const queryString = queries ? '?' + queries.map<string>(obj => obj.key + '=' + obj.value).join('&') : '';
        return API_URL + url + queryString;
    }

    dispose(): void {
        this.toDispose.dispose();
    }

    async updateSearch(param?: SearchParam): Promise<void> {
        const endpoint = this.createEndpoint(['-', 'search'], param && param.query ? [{ key: 'query', value: param.query }] : undefined);
        const extensions = await this.api.getExtensions(endpoint);
        this.model.registryExtensions = extensions;
        this.onDidUpdateSearchEmitter.fire(undefined);
    }

    async updateInstalled(): Promise<void> {
        const plugins = this.pluginSupport.plugins;
        const rawVSCodeExtensions: VSCodeExtensionPart[] = [];
        await Promise.all(plugins.map(async plugin => {
            if (plugin.model.engine.type === 'vscode') {
                const url = this.createEndpoint([plugin.model.publisher, plugin.model.name]);
                const ext = await this.api.getExtension(url);
                rawVSCodeExtensions.push({
                    ...ext,
                    url
                });
            }
        }));
        this.model.installedExtensions = rawVSCodeExtensions;
        this.onDidUpdateInstalledEmitter.fire();
    }

    async install(extension: VSCodeExtensionPart): Promise<void> {
        await this.pluginServer.deploy(extension.downloadUrl);
    }

    async uninstall(extension: VSCodeExtensionPart): Promise<void> {
        let res: () => void;
        const p = new Promise<void>(r => res = r);
        setTimeout(() => res(), 2000);
        return p;
    }

    async outdated(): Promise<VSCodeExtensionPart[]> {
        const result: VSCodeExtensionPart[] = [];
        const promises: Promise<void>[] = [];
        // TODO get outdated extensions
        await Promise.all(promises);
        return result;
    }

    async getExtensionDetail(extensionURL: string): Promise<VSCodeExtensionFull> {
        return this.api.getExtension(extensionURL);
    }

    async getExtensionReadMe(readMeUrl: string): Promise<string> {
        const readMeRaw = await this.api.getExtensionReadMe(readMeUrl);
        return readMeRaw;
    }

    async getExtensionReviews(reviewsUrl: string): Promise<VSCodeExtensionReviewList> {
        return this.api.getExtensionReviews(reviewsUrl);
    }

    async openExtensionDetail(extensionRaw: VSCodeExtensionPart): Promise<void> {
        const extension = await this.api.getExtension(extensionRaw.url);
        const extensionResolved = new VSCodeExtensionPartResolved(extension, this.model);
        const readMe = await this.compileDocumentation(extension);
        const options: VSCodeExtensionDetailOpenerOptions = {
            mode: 'reveal',
            extension: extensionResolved,
            readMe
        };
        open(this.openerService, VSCodeExtensionUri.toUri(extension.name), options);
    }

    protected async compileDocumentation(extension: VSCodeExtensionFull): Promise<string> {
        if (extension.readmeUrl) {
            const markdownConverter = new showdown.Converter({
                noHeaderId: true,
                strikethrough: true,
                headerLevelStart: 2
            });
            const readme = await this.api.getExtensionReadMe(extension.readmeUrl);
            const readmeHtml = markdownConverter.makeHtml(readme);
            return sanitize(readmeHtml, {
                allowedTags: sanitize.defaults.allowedTags.concat(['h1', 'h2', 'img'])
            });
        }
        return '';
    }
}
