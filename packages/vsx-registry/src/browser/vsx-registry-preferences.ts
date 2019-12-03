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

import { PreferenceSchema, PreferenceProxy, PreferenceService, createPreferenceProxy, PreferenceContribution } from '@theia/core/lib/browser';
import { interfaces } from 'inversify';

export const vsxRegistryPreferencesSchema: PreferenceSchema = {
    properties: {
        'vsx-registry.api-url': {
            type: 'string',
            description: 'The URL of the Open VSX Registry.',
            defaultValue: ''
        }
    }
};

export class VSXRegistryConfiguration {
    'vsx-registry.api-url': string;
}

export const VSXRegistryPreferences = Symbol('VSXRegistryPreferences');
export type VSXRegistryPreferences = PreferenceProxy<VSXRegistryConfiguration>;

export function createVSXRegistryPreferences(preferences: PreferenceService): VSXRegistryPreferences {
    return createPreferenceProxy(preferences, vsxRegistryPreferencesSchema);
}

export function bindVSXRegistryPreferences(bind: interfaces.Bind): void {
    bind(VSXRegistryPreferences).toDynamicValue(ctx => {
        const preferences = ctx.container.get<PreferenceService>(PreferenceService);
        return createVSXRegistryPreferences(preferences);
    }).inSingletonScope();
    bind(PreferenceContribution).toConstantValue({ schema: vsxRegistryPreferencesSchema });
}
