/* global jQuery */

/**
 * Internal dependencies
 */
import MediaActions from '../actions/media-actions';

const _get = function( url, data ) {
	return jQuery.ajax( {
		url,
		data,
		dataType: 'json',
	} );
};

export default {
	// Get a list of tweets according to args criteria
	getItems( args ) {
		const url = `${ tggrData.ApiUrl }tagregator/v1/items`;

		args = args || {};
		args.hashtags = tggrData.hashtags.split( ',' );

		jQuery.when(
			_get( url, args )
		).done( function( data ) {
			MediaActions.fetch( data );
		} );
	},
};
