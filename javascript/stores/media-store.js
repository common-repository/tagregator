/**
 * External dependencies
 */
import { ReduceStore } from 'flux/utils';
import { find, unionBy } from 'lodash';

/**
 * Internal dependencies
 */
import AppDispatcher from '../dispatcher/dispatcher';
import AppConstants from '../constants/constants';

/**
 * The max number of items in this list.
 *
 * @type {number}
 */
const maxItems = 100;

class MediaStore extends ReduceStore {
	constructor() {
		super( AppDispatcher );
	}

	getInitialState() {
		return [];
	}

	/**
	 * Get the current item
	 *
	 * @param {number} id - ID of item
	 * @return {Array} -
	 */
	getItem( id ) {
		const state = this._state;
		return find( state, ( _item ) => id === _item.id ) || {};
	}

	reduce( state, { actionType, data } ) {
		switch ( actionType ) {
			case AppConstants.REQUEST_ITEMS_SUCCESS:
				data.sort( function( a, b ) {
					const aDate = new Date( a.date );
					const bDate = new Date( b.date );
					return bDate - aDate;
				} );

				state = unionBy( data, state, 'ID' );

				// Keep only a set number of items: Only the most recent items are relevant to the user, and
				// a large page could drain browser resources.
				if ( state.length > maxItems ) {
					state = state.splice( 0, maxItems );
				}
				return state;

			default:
				return state;
		}
	}
}

export default new MediaStore();
