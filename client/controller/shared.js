/** @format */

/**
 * External dependencies
 */

import React from 'react';
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import config from 'config';
import { switchCSS } from 'lib/i18n-utils/switch-locale';
import { getCurrentUser } from 'state/current-user/selectors';
import { setSection as setSectionAction } from 'state/ui/actions';
import { getSection } from 'state/ui/selectors';
import { setLocale } from 'state/ui/language/actions';
import isRTL from 'state/selectors/is-rtl';

export function makeLayoutMiddleware( LayoutComponent ) {
	return ( context, next ) => {
		const { store, primary, secondary } = context;

		// On server, only render LoggedOutLayout when logged-out.
		if ( ! context.isServerSide || ! getCurrentUser( context.store.getState() ) ) {
			let redirectUri;
			if ( context.isServerSide ) {
				redirectUri = `${ context.protocol }://${ context.host }${ context.originalUrl }`;
			}
			context.layout = (
				<LayoutComponent
					store={ store }
					primary={ primary }
					secondary={ secondary }
					redirectUri={ redirectUri }
				/>
			);
		}
		next();
	};
}

export function setSection( section ) {
	return ( context, next = noop ) => {
		context.store.dispatch( setSectionAction( section ) );

		loadSectionCSS( context, next );
	};
}

function loadSectionCSS( context, next ) {
	const section = getSection( context.store.getState() );

	console.log('client/controller/shared.js');
	console.log(section);
	console.log(typeof document);

	if ( section.css && typeof document !== 'undefined' ) {

		console.log('BINGO #####################');


		const url = isRTL( context.store.getState() ) ? section.css.urls.rtl : section.css.urls.ltr;

		switchCSS( 'section-css-' + section.css.id, url, next );

		return;
	}

	next();
}

export function setUpLocale( context, next ) {
	const currentUser = getCurrentUser( context.store.getState() );

	if ( context.params.lang ) {
		context.lang = context.params.lang;
	} else if ( currentUser ) {
		context.lang = currentUser.localeSlug;
	}

	context.store.dispatch( setLocale( context.lang || config( 'i18n_default_locale_slug' ) ) );

	loadSectionCSS( context, next );
}
