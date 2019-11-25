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
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
// some code is copied and modified from:
// https://github.com/microsoft/vscode/blob/7cf4cca47aa025a590fc939af54932042302be63/src/vs/workbench/services/themes/browser/fileIconThemeData.ts

import * as jsoncparser from 'jsonc-parser';
import { injectable, inject, postConstruct } from 'inversify';
import { FileSystem, FileStat } from '@theia/filesystem/lib/common';
import { IconThemeService, IconTheme, IconThemeDefinition } from '@theia/core/lib/browser/icon-theme-service';
import { IconThemeContribution, DeployedPlugin, UiTheme, getPluginId } from '../../common/plugin-protocol';
import URI from '@theia/core/lib/common/uri';
import { Disposable, DisposableCollection } from '@theia/core/lib/common/disposable';
import { Emitter } from '@theia/core/lib/common/event';
import { RecursivePartial } from '@theia/core/lib/common/types';
import { LabelProviderContribution, DidChangeLabelEvent, LabelProvider } from '@theia/core/lib/browser/label-provider';
import { ThemeType } from '@theia/core/lib/browser/theming';
import { FileStatNode, DirNode } from '@theia/filesystem/lib/browser';
import { WorkspaceRootNode } from '@theia/navigator/lib/browser/navigator-tree';

export interface PluginIconDefinition {
    iconPath: string;
    fontColor: string;
    fontCharacter: string;
    fontSize: string;
    fontId: string;
}

export interface PluginFontDefinition {
    id: string;
    weight: string;
    style: string;
    size: string;
    src: { path: string; format: string; }[];
}

export interface PluginIconsAssociation {
    folder?: string;
    file?: string;
    folderExpanded?: string;
    rootFolder?: string;
    rootFolderExpanded?: string;
    folderNames?: { [folderName: string]: string; };
    folderNamesExpanded?: { [folderName: string]: string; };
    fileExtensions?: { [extension: string]: string; };
    fileNames?: { [fileName: string]: string; };
    languageIds?: { [languageId: string]: string; };
}

export interface PluginIconDefinitions {
    [key: string]: PluginIconDefinition
}

export interface PluginIconThemeDocument extends PluginIconsAssociation {
    iconDefinitions: PluginIconDefinitions;
    fonts: PluginFontDefinition[];
    light?: PluginIconsAssociation;
    highContrast?: PluginIconsAssociation;
    hidesExplorerArrows?: boolean;
}

export const PluginIconThemeFactory = Symbol('PluginIconThemeFactory');
export type PluginIconThemeFactory = (definition: PluginIconThemeDefinition) => PluginIconTheme;

@injectable()
export class PluginIconThemeDefinition implements IconThemeDefinition, IconThemeContribution {
    id: string;
    label: string;
    description?: string;
    uri: string;
    uiTheme?: UiTheme;
    pluginId: string;
    packagePath: string;
}

@injectable()
export class PluginIconTheme extends PluginIconThemeDefinition implements IconTheme, Disposable {

    @inject(FileSystem)
    protected readonly fileSystem: FileSystem;

    @inject(LabelProvider)
    protected readonly labelProvider: LabelProvider;

    @inject(PluginIconThemeDefinition)
    protected readonly definition: PluginIconThemeDefinition;

    protected readonly onDidChangeEmitter = new Emitter<DidChangeLabelEvent>();
    readonly onDidChange = this.onDidChangeEmitter.event;

    protected readonly toDispose = new DisposableCollection(this.onDidChangeEmitter);

    protected styleSheetContent: string | undefined;

    protected packageUri: URI;
    protected locationUri: URI;

    @postConstruct()
    protected init(): void {
        Object.assign(this, this.definition);
        this.packageUri = new URI(this.packagePath);
        this.locationUri = new URI(this.uri).parent;
    }

    dispose(): void {
        this.toDispose.dispose();
    }

    protected fireDidChange(): void {
        this.onDidChangeEmitter.fire({ affects: () => true });
    }

    activate(): Disposable {
        const toDeactivate = new DisposableCollection(Disposable.create(() => { /* mark as not disposed */ }));
        this.fireDidChange();
        toDeactivate.push(Disposable.create(() => this.fireDidChange()));
        this.doActivate(toDeactivate);
        return toDeactivate;
    }

    protected async doActivate(toDeactivate: DisposableCollection): Promise<void> {
        await this.load();
        if (toDeactivate.disposed) {
            return;
        }
        const styleElement = document.createElement('style');
        styleElement.type = 'text/css';
        styleElement.className = 'theia-icon-theme';
        styleElement.innerHTML = this.styleSheetContent!;
        document.head.appendChild(styleElement);
        toDeactivate.push(Disposable.create(() => styleElement.remove()));
    }

    /**
     * This should be aligned with
     * https://github.com/microsoft/vscode/blob/7cf4cca47aa025a590fc939af54932042302be63/src/vs/workbench/services/themes/browser/fileIconThemeData.ts#L201
     */
    protected async load(): Promise<void> {
        if (this.styleSheetContent !== undefined) {
            return;
        }
        this.styleSheetContent = '';
        const { content } = await this.fileSystem.resolveContent(this.uri);
        const json: RecursivePartial<PluginIconThemeDocument> = jsoncparser.parse(content, undefined, { disallowComments: false });
        const iconDefinitions = json.iconDefinitions;
        if (!iconDefinitions) {
            return;
        }
        const definitionSelectors = new Map<string, string[]>();
        const acceptSelector = (themeType: ThemeType, definitionId: string, selector: string) => {
            if (!iconDefinitions[definitionId]) {
                return;
            }
            const selectors = definitionSelectors.get(definitionId) || [];
            if (themeType !== 'dark') {
                selector = '.theia-' + themeType + ' ' + selector;
            }
            selectors.push(selector);
            definitionSelectors.set(definitionId, selectors);
        };
        this.collectSelectors(json, acceptSelector.bind(undefined, 'dark'));
        if (json.light) {
            this.collectSelectors(json.light, acceptSelector.bind(undefined, 'light'));
        }
        if (json.highContrast) {
            this.collectSelectors(json.highContrast, acceptSelector.bind(undefined, 'hc'));
        }

        const fonts = json.fonts;
        if (Array.isArray(fonts)) {
            for (const font of fonts) {
                if (font) {
                    let src = '';
                    if (Array.isArray(font.src)) {
                        for (const srcLocation of font.src) {
                            if (srcLocation && srcLocation.path) {
                                const cssUrl = this.toCSSUrl(srcLocation.path);
                                if (cssUrl) {
                                    if (src) {
                                        src += ', ';
                                    }
                                    src += `${cssUrl} format('${srcLocation.format}')`;
                                }
                            }
                        }
                    }
                    if (src) {
                        this.styleSheetContent += `@font-face {
    src: ${src};
    font-family: '${font.id}';
    font-weight: ${font.weight};
    font-style: ${font.style};
}
`;
                    }
                }
            }
            const firstFont = fonts[0];
            if (firstFont && firstFont.id) {
                this.styleSheetContent += `.${this.fileIcon}::before, .${this.folderIcon}::before, .${this.rootFolderIcon}::before {
    font-family: '${firstFont.id}';
    font-size: ${firstFont.size || '150%'}
}
`;
            }
        }

        for (const definitionId of definitionSelectors.keys()) {
            const iconDefinition = iconDefinitions[definitionId];
            const selectors = definitionSelectors.get(definitionId);
            if (selectors && iconDefinition) {
                const cssUrl = this.toCSSUrl(iconDefinition.iconPath);
                if (cssUrl) {
                    this.styleSheetContent += `${selectors.join(', ')} {
    display: inline-block;
    width: 16px;
    height: 16px;
    background-size: 16px;
    background-image: ${cssUrl};
}
`;
                }
                if (iconDefinition.fontCharacter || iconDefinition.fontColor) {
                    let body = '';
                    if (iconDefinition.fontColor) {
                        body += ` color: ${iconDefinition.fontColor};`;
                    }
                    if (iconDefinition.fontCharacter) {
                        body += ` content: '${iconDefinition.fontCharacter}';`;
                    }
                    if (iconDefinition.fontSize) {
                        body += ` font-size: ${iconDefinition.fontSize};`;
                    }
                    if (iconDefinition.fontId) {
                        body += ` font-family: ${iconDefinition.fontId};`;
                    }
                    this.styleSheetContent += `${selectors.map(s => s + '::before').join(', ')} {${body} }\n`;
                }
            }
        }
    }

    protected toCSSUrl(iconPath: string | undefined): string | undefined {
        if (!iconPath) {
            return undefined;
        }
        const iconUri = this.locationUri.resolve(iconPath);
        const relativePath = this.packageUri.path.relative(iconUri.path.normalize());
        return relativePath && `url('hostedPlugin/${this.pluginId}/${encodeURIComponent(relativePath.normalize().toString())}')`;
    }

    protected escapeCSS(value: string): string {
        try {
            return CSS.escape(value);
        } catch {
            // Edge and Safari on iOS does not support `CSS.escape` yet, remove it when they do
            value = value.replace(/[^\-a-zA-Z0-9]/g, '-');
            if (value.charAt(0).match(/[0-9\-]/)) {
                value = '-' + value;
            }
            return value;
        }
    }

    protected readonly fileIcon = 'theia-plugin-file-icon';
    protected readonly folderIcon = 'theia-plugin-folder-icon';
    protected readonly folderExpandedIcon = 'theia-plugin-folder-expanded-icon';
    protected readonly rootFolderIcon = 'theia-plugin-root-folder-icon';
    protected readonly rootFolderExpandedIcon = 'theia-plugin-root-folder-expanded-icon';
    protected folderNameIcon(folderName: string): string {
        return 'theia-plugin-' + this.escapeCSS(folderName.toLowerCase()) + '-folder-name-icon';
    }
    protected expandedFolderNameIcon(folderName: string): string {
        return 'theia-plugin-' + this.escapeCSS(folderName.toLowerCase()) + '-expanded-folder-name-icon';
    }
    protected fileNameIcon(fileName: string): string[] {
        fileName = fileName.toLowerCase();
        const extIndex = fileName.indexOf('.');
        const icons = extIndex !== -1 ? this.fileExtensionIcon(fileName.substr(extIndex + 1)) : [];
        icons.unshift('theia-plugin-' + this.escapeCSS(fileName) + '-file-name-icon');
        return icons;
    }
    protected fileExtensionIcon(fileExtension: string): string[] {
        fileExtension = fileExtension.toString();
        const icons = [];
        const segments = fileExtension.split('.');
        if (segments.length) {
            if (segments.length) {
                for (let i = 0; i < segments.length; i++) {
                    icons.push('theia-plugin-' + this.escapeCSS(segments.slice(i).join('.')) + '-ext-file-icon');
                }
                icons.push('theia-plugin-ext-file-icon'); // extra segment to increase file-ext score
            }
        }
        return icons;
    }
    protected languageIcon(languageId: string): string {
        return 'theia-plugin-' + this.escapeCSS(languageId) + '-lang-file-icon';
    }

    protected collectSelectors(
        associations: RecursivePartial<PluginIconsAssociation>,
        accept: (definitionId: string, selector: string) => void
    ): void {
        if (associations.folder) {
            accept(associations.folder, '.' + this.folderIcon);
        }
        if (associations.folderExpanded) {
            accept(associations.folderExpanded, '.' + this.folderExpandedIcon);
        }
        const rootFolder = associations.rootFolder || associations.folder;
        if (rootFolder) {
            accept(rootFolder, '.' + this.rootFolderIcon);
        }
        const rootFolderExpanded = associations.rootFolderExpanded || associations.folderExpanded;
        if (rootFolderExpanded) {
            accept(rootFolderExpanded, '.' + this.rootFolderExpandedIcon);
        }
        if (associations.file) {
            accept(associations.file, '.' + this.fileIcon);
        }
        const folderNames = associations.folderNames;
        if (folderNames) {
            // tslint:disable-next-line:forin
            for (const folderName in folderNames) {
                accept(folderNames[folderName]!, '.' + this.folderNameIcon(folderName) + '.' + this.folderIcon);
            }
        }
        const folderNamesExpanded = associations.folderNamesExpanded;
        if (folderNamesExpanded) {
            // tslint:disable-next-line:forin
            for (const folderName in folderNamesExpanded) {
                accept(folderNamesExpanded[folderName]!, '.' + this.expandedFolderNameIcon(folderName) + '.' + this.folderExpandedIcon);
            }
        }
        const fileNames = associations.fileNames;
        if (fileNames) {
            // tslint:disable-next-line:forin
            for (const fileName in fileNames) {
                accept(fileNames[fileName]!, this.fileNameIcon(fileName).reduce((r, v) => r + '.' + v, '') + '.' + this.fileIcon);
            }
        }
        const fileExtensions = associations.fileExtensions;
        if (fileExtensions) {
            // tslint:disable-next-line:forin
            for (const fileExtension in fileExtensions) {
                accept(fileExtensions[fileExtension]!, this.fileExtensionIcon(fileExtension).reduce((r, v) => r + '.' + v, '') + '.' + this.fileIcon);
            }
        }
        const languageIds = associations.languageIds;
        if (fileExtensions) {
            // tslint:disable-next-line:forin
            for (const languageId in languageIds) {
                accept(languageIds[languageId]!, '.' + this.languageIcon(languageId) + '.' + this.fileIcon);
            }
        }
    }

    /**
     * This should be aligned with
     * https://github.com/microsoft/vscode/blob/7cf4cca47aa025a590fc939af54932042302be63/src/vs/editor/common/services/getIconClasses.ts#L5
     */
    getIcon(element: URI | FileStat | FileStatNode | WorkspaceRootNode): string {
        if (WorkspaceRootNode.is(element)) {
            const name = this.labelProvider.getName(element);
            if (element.expanded) {
                return this.rootFolderExpandedIcon + ' ' + this.expandedFolderNameIcon(name);
            }
            return this.rootFolderIcon + ' ' + this.folderNameIcon(name);
        } if (DirNode.is(element)) {
            if (element.expanded) {
                const name = this.labelProvider.getName(element);
                return this.folderExpandedIcon + ' ' + this.expandedFolderNameIcon(name);
            }
            return this.getFolderIcon(element);
        }
        if (FileStatNode.is(element)) {
            return this.getFileIcon(element, element.fileStat.uri);
        }
        if (FileStat.is(element)) {
            if (element.isDirectory) {
                return this.getFolderIcon(element);
            }
            return this.getFileIcon(element, element.uri);
        }
        if (!element.path.ext) {
            return this.getFolderIcon(element);
        }
        return this.getFileIcon(element, element.toString());
    }

    protected getFolderIcon(element: object): string {
        const name = this.labelProvider.getName(element);
        return this.folderIcon + ' ' + this.folderNameIcon(name);
    }

    protected getFileIcon(element: URI | FileStat | FileStatNode, uri: string): string {
        const name = this.labelProvider.getName(element);
        const classNames = this.fileNameIcon(name);
        classNames.unshift(this.fileIcon);
        const language = monaco.services.StaticServices.modeService.get().createByFilepathOrFirstLine(monaco.Uri.parse(uri));
        classNames.push(this.languageIcon(language.languageIdentifier.language));
        return classNames.join(' ');
    }

}

@injectable()
export class PluginIconThemeService implements LabelProviderContribution {

    @inject(IconThemeService)
    protected readonly iconThemeService: IconThemeService;

    @inject(PluginIconThemeFactory)
    protected readonly iconThemeFactory: PluginIconThemeFactory;

    protected readonly onDidChangeEmitter = new Emitter<DidChangeLabelEvent>();
    readonly onDidChange = this.onDidChangeEmitter.event;

    protected fireDidChange(): void {
        this.onDidChangeEmitter.fire({ affects: () => true });
    }

    register(contribution: IconThemeContribution, plugin: DeployedPlugin): Disposable {
        const pluginId = getPluginId(plugin.metadata.model);
        const packagePath = plugin.metadata.model.packagePath;
        const iconTheme = this.iconThemeFactory({
            id: pluginId + '-' + contribution.id,
            label: contribution.label || new URI(contribution.uri).path.base,
            description: contribution.description,
            uri: contribution.uri,
            uiTheme: contribution.uiTheme,
            pluginId,
            packagePath
        });
        return new DisposableCollection(
            iconTheme,
            iconTheme.onDidChange(() => this.fireDidChange()),
            this.iconThemeService.register(iconTheme)
        );
    }

    canHandle(element: object): number {
        const current = this.iconThemeService.getDefinition(this.iconThemeService.current);
        if (current instanceof PluginIconTheme && (
            (element instanceof URI && element.scheme === 'file') || FileStat.is(element) || FileStatNode.is(element)
        )) {
            return Number.MAX_SAFE_INTEGER;
        }
        return 0;
    }

    getIcon(element: URI | FileStat | FileStatNode | WorkspaceRootNode): string | undefined {
        const current = this.iconThemeService.getDefinition(this.iconThemeService.current);
        if (current instanceof PluginIconTheme) {
            return current.getIcon(element);
        }
        return undefined;
    }

}
