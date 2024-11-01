/**
 * External dependencies
 */
import moment from 'moment-timezone';

export function getContent( data ) {
	return { __html: data };
}

export function getTimeDiff( date ) {
	return moment.tz( date, 'UTC' ).fromNow();
}
