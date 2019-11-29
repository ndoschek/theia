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

import { VSCodeExtensionsModel } from './vscode-extensions-model';

export class VSCodeExtensionPart {
    readonly name: string;
    readonly publisher: string;
    readonly url: string;
    readonly downloadUrl: string;
    readonly description?: string;
    readonly iconUrl?: string;
    readonly displayName?: string;
    readonly version?: string;
    readonly averageRating?: number;
    readonly timestamp?: number;
}

export class VSCodeExtensionFull extends VSCodeExtensionPart {
    readonly publisherUrl: string;
    readonly reviewsUrl: string;
    readonly reviewCount: number;
    readonly error?: string;
    readonly readmeUrl?: string;
    readonly allVersions?: { [key: string]: string };
    readonly preview?: boolean;
    readonly categories?: string[];
    readonly tags?: string[];
    readonly license?: string;
    readonly homepage?: string;
    readonly repository?: string;
    readonly bugs?: string;
    readonly markdown?: string;
    readonly galleryColor?: string;
    readonly galleryTheme?: string;
    readonly qna?: string;
    readonly badges?: Badge[];
    readonly dependencies?: ExtensionReference[];
    readonly bundledExtensions?: ExtensionReference[];
}

export class VSCodeExtensionPartResolved extends VSCodeExtensionPart {
    outdated?: boolean;

    constructor(extension: VSCodeExtensionPart, protected model: VSCodeExtensionsModel) {
        super();
        Object.assign(this, extension);
    }

    get installed(): boolean {
        const installed = !!this.model.getExtensionsByLocation('installed')
            .find(ext => this.publisher === ext.publisher && this.name === ext.name);
        return installed;
    }
}

export type VSCodeExtensionFullResolved = VSCodeExtensionPartResolved & VSCodeExtensionFull;

export interface Badge {
    url: string;
    href: string;
    description: string;
}

export interface ExtensionReference {
    publisher: string;
    extension: string;
    version?: string;
}

export interface SearchParam {
    query?: string;
    size?: number;
    offset?: number;
    [key: string]: string | number | undefined;
}

export type StarNumber = 1 | 2 | 3 | 4 | 5;
export interface VSCodeExtensionReview {
    rating: StarNumber;
    title: string;
    comment: string;
    user: string; // ExtensionRegistryUser;
    timestamp?: string;
}

export interface VSCodeExtensionReviewList {
    postUrl: string;
    reviews: VSCodeExtensionReview[];
}

export type VSCodeExtensionsLocation = 'installed' | 'registry';
