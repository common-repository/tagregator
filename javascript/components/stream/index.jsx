/**
 * External dependencies
 */
import { Container } from 'flux/utils';
import { isEqual } from 'lodash';

/**
 * WordPress dependencies
 */
import { Component, createRef } from '@wordpress/element';

/**
 * Internal dependencies
 */
import API from '../../utils/api';
import Flickr from '../flickr';
import Google from '../google';
import Instagram from '../instagram';
import MediaStore from '../../stores/media-store';
import Tweet from '../tweet';
import './style.scss';

let _interval;

/**
 * Determines if the top of an element is visible in the viewport
 *
 * @param {string} element
 * @return {boolean} -
 */
function isScrolledIntoView( element ) {
	return element.getBoundingClientRect().top >= 0;
}

class Stream extends Component {
	constructor( props ) {
		super( props );
		this.container = createRef();
		this.getItems = this.getItems.bind( this );
	}

	static getStores() {
		return [ MediaStore ];
	}

	static calculateState() {
		return {
			fetching: false,
			data: MediaStore.getState(),
		};
	}

	getItems() {
		const intervalSeconds = tggrData.refreshInterval || 30;
		if ( ! this.state.fetching && ( isScrolledIntoView( this.container.current ) || this.state.data.length < 1 ) ) {
			this.setState( { fetching: true } );
			API.getItems();
			if ( 'undefined' === typeof _interval ) {
				_interval = setInterval( this.getItems, intervalSeconds * 1000 );
			}
		}
	}

	componentDidMount() {
		this.getItems();
	}

	componentDidUpdate( prevProps ) {
		if ( ! isEqual( prevProps, this.props ) ) {
			clearInterval( _interval );
			this.getItems();
		}
	}

	componentWillUnmount() {
		clearInterval( _interval );
	}

	render() {
		const layout = tggrData.layout || 'three-column';
		let items = this.state.data.map( function( item, i ) {
			let rendered;

			switch ( item.post_type ) {
				case 'tggr-tweets':
					rendered = ( <Tweet key={ i } item={ item } layout={ layout } /> );
					break;
				case 'tggr-instagram':
					rendered = ( <Instagram key={ i } item={ item } layout={ layout } /> );
					break;
				case 'tggr-flickr':
					rendered = ( <Flickr key={ i } item={ item } layout={ layout } /> );
					break;
				case 'tggr-google':
					rendered = ( <Google key={ i } item={ item } layout={ layout } /> );
					break;
				default:
					rendered = ( <div key={ i }>No handler for this media type: { item.post_type }</div> );
					break;
			}

			return rendered;
		} );

		if ( items.length < 1 && ! this.state.fetching ) {
			items = ( <div><p>No results found for { tggrData.hashtags } (yet).</p></div> );
		}

		return (
			<div className="tggr-stream" ref={ this.container }>
				{ this.state.fetching
					? <div className="tggr-loading" style={ { height: '20px' } }>
						<i className="icon icon-spinner icon-spin"></i>
						<span className="assistive-text screen-reader-text">Loading More</span>
					</div>
					: null
				}

				<div className="tggr-media-items" style={ { marginTop: this.state.fetching ? '15px' : '35px' } }>
					{ items }
				</div>
			</div>
		);
	}
}

export default Container.create( Stream );
