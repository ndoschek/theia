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

interface VSCodeExtensionStarsProps {
    number: number
}

export class VSCodeExtensionStars extends React.Component<VSCodeExtensionStarsProps> {
    render(): JSX.Element {
        return <React.Fragment>
            <div className='extension-rating-stars'>
                {this.getStar(1)}{this.getStar(2)}{this.getStar(3)}{this.getStar(4)}{this.getStar(5)}
            </div>
        </React.Fragment>;
    }

    protected getStar(i: number): React.ReactNode {
        return i <= this.props.number ?
            <span className='fa fa-star' />
            :
            i > this.props.number && i - this.props.number < 1 ?
                <span className='fa fa-star-half-o' />
                :
                <span className='fa fa-star-o' />;
    }
}
