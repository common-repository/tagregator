/**
 * Internal dependencies
 */
import AppDispatcher from '../dispatcher/dispatcher';
import AppConstants from '../constants/constants';

export default {
	/**
	 * @param  {Array}  posts
	 */
	fetch( posts ) {
		AppDispatcher.dispatch( {
			actionType: AppConstants.REQUEST_ITEMS_SUCCESS,
			data: posts,
		} );
	},
};
