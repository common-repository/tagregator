/**
 * Internal dependencies
 */
import { getContent, getTimeDiff } from '../../utils/content';
import './style.scss';

export default function Google( { item } ) {
	if ( ! item ) {
		return null;
	}
	const url = 'https://plus.google.com/';
	const author = item.itemMeta.author;
	const content = item.itemMeta.showExcerpt ? item.post_excerpt : item.post_content;

	const media = item.itemMeta.media.map( function( image, i ) {
		let img;
		if ( 'image' === image.type ) {
			img = ( <img key={ i } src={ `${ image.small_url }` } alt="" /> );
		}
		return img;
	} );

	return (
		<div className={ item.itemMeta.cssClasses }>
			<a className="tggr-author-profile clearfix" href={ url + author.userId } rel="nofollow">
				{ author.image && <img src={ author.image } alt="" className="tggr-author-avatar" /> }
				<span className="tggr-author-name">{ author.name }</span>
				<span className="tggr-author-username">@{ author.username }</span>
			</a>

			<div className="tggr-item-content">
				<div dangerouslySetInnerHTML={ getContent( content ) } />
				{ media }
				{ item.itemMeta.showExcerpt && <p><a href={ item.itemMeta.mediaPermalink } rel="nofollow">Read the rest of this post on Google+</a></p> }
			</div>

			<a href={ item.itemMeta.mediaPermalink } rel="nofollow" className="tggr-timestamp">
				{ getTimeDiff( item.post_date_gmt ) }
			</a>

			<img className="tggr-source-logo" src={ tggrData.logos.google } alt="Google" />
		</div>
	);
}
