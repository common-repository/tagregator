/**
 * Internal dependencies
 */
import { getContent, getTimeDiff } from '../../utils/content';
import './style.scss';

export default function Tweet( { item } ) {
	if ( ! item ) {
		return null;
	}
	const url = 'https://twitter.com/';
	const author = item.itemMeta.author;
	const content = item.itemMeta.showExcerpt ? item.post_excerpt : item.post_content;

	const media = item.itemMeta.media.map( ( image, i ) => {
		let img;
		if ( 'image' === image.type ) {
			img = ( <img key={ i } src={ `${ image.url }:small` } alt="" /> );
		}
		return img;
	} );

	// todo maybe change star icon to heart -- https://wordpress.org/support/topic/twitter-stars-should-be-hearts/

	return (
		<div className={ item.itemMeta.cssClasses }>
			<a className="tggr-author-profile clearfix" href={ url + author.username } rel="nofollow">
				{ author.image && <img src={ author.image } alt="" className="tggr-author-avatar" /> }
				<span className="tggr-author-name">{ author.name }</span>
				<span className="tggr-author-username">@{ author.username }</span>
			</a>

			<div className="tggr-item-content">
				<div dangerouslySetInnerHTML={ getContent( content ) } />
				{ item.itemMeta.showExcerpt && <p><a href={ item.itemMeta.mediaPermalink } rel="nofollow">Read the rest of this tweet on Twitter</a></p> }

				{ media }
			</div>

			<ul className="tggr-actions">
				<li><a href={ `${ url }intent/tweet?in_reply_to=${ item.itemMeta.tweetId }` } rel="nofollow"><i className="icon-reply"></i> <span>Reply</span></a></li>
				<li><a href={ `${ url }intent/retweet?tweet_id=${ item.itemMeta.tweetId }` } rel="nofollow"><i className="icon-retweet"></i> <span>Retweet</span></a></li>
				<li><a href={ `${ url }intent/favorite?tweet_id=${ item.itemMeta.tweetId }` } rel="nofollow"><i className="icon-star"></i> <span>Favorite</span></a></li>
			</ul>

			<a href={ item.itemMeta.mediaPermalink } rel="nofollow" className="tggr-timestamp">
				{ getTimeDiff( item.post_date_gmt ) }
			</a>

			<img className="tggr-source-logo" src={ tggrData.logos.twitter } alt="Twitter" />
		</div>
	);
}
