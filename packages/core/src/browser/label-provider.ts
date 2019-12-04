/********************************************************************************
 * Copyright (C) 2017 TypeFox and others.
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

import { inject, injectable, named } from 'inversify';
import * as fileIcons from 'file-icons-js';
import URI from '../common/uri';
import { ContributionProvider } from '../common/contribution-provider';
import { Prioritizeable } from '../common/types';
import { Event, Emitter } from '../common';
import { FrontendApplicationContribution } from './frontend-application';

export const FOLDER_ICON = 'fa fa-folder';
export const FILE_ICON = 'fa fa-file';

export const LabelProviderContribution = Symbol('LabelProviderContribution');
export interface LabelProviderContribution {

    /**
     * whether this contribution can handle the given element and with what priority.
     * All contributions are ordered by the returned number if greater than zero. The highest number wins.
     * If two or more contributions return the same positive number one of those will be used. It is undefined which one.
     */
    canHandle(element: object): number;

    /**
     * returns an icon class for the given element.
     */
    getIcon?(element: object): string | undefined;

    /**
     * returns a short name for the given element.
     */
    getName?(element: object): string | undefined;

    /**
     * returns a long name for the given element.
     */
    getLongName?(element: object): string | undefined;

    /**
     * Emit when something has changed that may result in this label provider returning a different
     * value for one or more properties (name, icon etc).
     */
    readonly onDidChange?: Event<DidChangeLabelEvent>;

    /**
     * Check whether the given element is affected by the given change event.
     * Contributions delegating to the label provider can use this hook
     * to perfrom a recursive check.
     */
    affects?(element: object, event: DidChangeLabelEvent): boolean;

}

export interface DidChangeLabelEvent {
    affects(element: object): boolean;
}

@injectable()
export class DefaultUriLabelProviderContribution implements LabelProviderContribution {

    canHandle(uri: object): number {
        if (uri instanceof URI) {
            return 1;
        }
        return 0;
    }

    getIcon(uri: URI): string {
        const iconClass = this.getFileIcon(uri);
        if (!iconClass) {
            if (uri.displayName.indexOf('.') === -1) {
                return FOLDER_ICON;
            } else {
                return FILE_ICON;
            }
        }
        return iconClass;
    }

    protected getFileIcon(uri: URI): string | undefined {
        return fileIcons.getClassWithColor(uri.displayName);
    }

    getName(uri: URI): string {
        return uri.displayName;
    }

    getLongName(uri: URI): string {
        return uri.path.toString();
    }
}

@injectable()
export class LabelProvider implements FrontendApplicationContribution {

    protected readonly onDidChangeEmitter = new Emitter<DidChangeLabelEvent>();

    @inject(ContributionProvider) @named(LabelProviderContribution)
    protected readonly contributionProvider: ContributionProvider<LabelProviderContribution>;

    /**
     * Start listening to contributions.
     *
     * Don't call this method directly!
     * It's called by the frontend application during initialization.
     */
    initialize(): void {
        const contributions = this.contributionProvider.getContributions();
        for (const eventContribution of contributions) {
            if (eventContribution.onDidChange) {
                eventContribution.onDidChange(event => {
                    this.onDidChangeEmitter.fire({
                        affects: element => this.affects(element, event)
                    });
                });
            }
        }
    }

    protected affects(element: object, event: DidChangeLabelEvent): boolean {
        if (event.affects(element)) {
            return true;
        }
        for (const contribution of this.findContribution(element)) {
            if (contribution.affects && contribution.affects(element, event)) {
                return true;
            }
        }
        return false;
    }

    get onDidChange(): Event<DidChangeLabelEvent> {
        return this.onDidChangeEmitter.event;
    }

    getIcon(element: object): string {
        const contributions = this.findContribution(element);
        for (const contribution of contributions) {
            const value = contribution.getIcon && contribution.getIcon(element);
            if (value === undefined) {
                continue;
            }
            return value;
        }
        return '';
    }

    getName(element: object): string {
        const contributions = this.findContribution(element);
        for (const contribution of contributions) {
            const value = contribution.getName && contribution.getName(element);
            if (value === undefined) {
                continue;
            }
            return value;
        }
        return '<unknown>';
    }

    getLongName(element: object): string {
        const contributions = this.findContribution(element);
        for (const contribution of contributions) {
            const value = contribution.getLongName && contribution.getLongName(element);
            if (value === undefined) {
                continue;
            }
            return value;
        }
        return '';
    }

    protected findContribution(element: object): LabelProviderContribution[] {
        const prioritized = Prioritizeable.prioritizeAllSync(this.contributionProvider.getContributions(), contrib =>
            contrib.canHandle(element)
        );
        return prioritized.map(c => c.value);
    }
}
