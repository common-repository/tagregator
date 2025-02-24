<?php

defined( 'WPINC' ) || die();

if ( ! class_exists( 'Tagregator' ) ) {
	/**
	 * Main / front controller class
	 *
	 * @package Tagregator
	 */
	class Tagregator extends TGGRModule {
		protected static $readable_properties  = array( 'modules', 'media_sources' );
		protected static $writeable_properties = array( 'modules', 'media_sources' );
		protected $modules;
		protected $media_sources;

		const VERSION    = '0.6';
		const PREFIX     = 'tggr_';
		const CSS_PREFIX = 'tggr-';
		const DEBUG_MODE = false;
		const CACHE_BUST = '2';

		/**
		 * Constructor
		 *
		 * @mvc Controller
		 */
		protected function __construct() {
			$this->register_hook_callbacks();

			$this->modules = apply_filters(
				self::PREFIX . 'modules',
				array(
					'TGGRSettings'            => TGGRSettings::get_instance(),
					'TGGRShortcodeTagregator' => TGGRShortcodeTagregator::get_instance(),
				)
			);

			$this->media_sources = apply_filters(
				self::PREFIX . 'media_sources',
				array(
					'TGGRSourceTwitter'   => TGGRSourceTwitter::get_instance(),
					'TGGRSourceInstagram' => TGGRSourceInstagram::get_instance(),
					'TGGRSourceFlickr'    => TGGRSourceFlickr::get_instance(),
					'TGGRSourceGoogle'    => TGGRSourceGoogle::get_instance(),
				)
			);
		}

		/**
		 * Prepares sites to use the plugin during single or network-wide activation
		 *
		 * @mvc Controller
		 *
		 * @param bool $network_wide
		 */
		public function activate( $network_wide ) {
			global $wpdb;

			if ( function_exists( 'is_multisite' ) && is_multisite() ) {
				if ( $network_wide ) {
					$blogs = $wpdb->get_col( "SELECT blog_id FROM $wpdb->blogs" );

					foreach ( $blogs as $blog ) {
						switch_to_blog( $blog );
						$this->single_activate( $network_wide );
					}

					restore_current_blog();
				} else {
					$this->single_activate( $network_wide );
				}
			} else {
				$this->single_activate( $network_wide );
			}
		}

		/**
		 * Runs activation code on a new WPMS site when it's created
		 *
		 * @mvc Controller
		 *
		 * @param WP_Site $new_site
		 */
		public function activate_new_site( $new_site ) {
			switch_to_blog( $new_site->blog_id );
			$this->single_activate( true );
			restore_current_blog();
		}

		/**
		 * Prepares a single blog to use the plugin
		 *
		 * @mvc Controller
		 *
		 * @param bool $network_wide
		 */
		protected function single_activate( $network_wide ) {
			foreach ( $this->modules as $module ) {
				$module->activate( $network_wide );
			}

			flush_rewrite_rules();
		}

		/**
		 * Rolls back activation procedures when de-activating the plugin
		 *
		 * @mvc Controller
		 */
		public function deactivate() {
			foreach ( $this->modules as $module ) {
				$module->deactivate();
			}

			flush_rewrite_rules();
		}

		/**
		 * Register callbacks for actions and filters
		 *
		 * @mvc Controller
		 */
		public function register_hook_callbacks() {
			add_action( 'wp_initialize_site', array( $this, 'activate_new_site' ) );
			add_action( 'init',               array( $this, 'init' ) );
			add_action( 'init',               array( $this, 'upgrade' ), 11 );
			add_action( 'wp_enqueue_scripts', __CLASS__ . '::load_resources' );
			add_filter( 'wp_link_query_args', 'TGGRMediaSource::exclude_from_insert_link_results' );
		}

		/**
		 * Initializes variables
		 *
		 * @mvc Controller
		 */
		public function init() {}

		/**
		 * Checks if the plugin was recently updated and upgrades if necessary
		 *
		 * @mvc Controller
		 *
		 * @param string $db_version
		 */
		public function upgrade( $db_version = 0 ) {
			if ( version_compare( $this->modules['TGGRSettings']->settings['db_version'], self::VERSION, '==' ) ) {
				return;
			}

			foreach ( $this->modules as $module ) {
				$module->upgrade( $this->modules['TGGRSettings']->settings['db_version'] );
			}

			$this->modules['TGGRSettings']->settings = array( 'db_version' => self::VERSION );
		}

		/**
		 * Enqueues CSS, JavaScript, etc
		 *
		 * @mvc Controller
		 */
		public static function load_resources() {
			$deps_path   = dirname( __DIR__ ) . '/build/index.asset.php';
			$script_info = file_exists( $deps_path )
				? require $deps_path
				: array(
					'dependencies' => array(),
					'version'      => filemtime( dirname( __DIR__ ) . '/build/index.js' ),
				);

			// Extra dependencies, which aren't added by webpack plugin.
			$script_info['dependencies'][] = 'jquery';
			$script_info['dependencies'][] = 'wp-date';

			wp_register_script(
				self::PREFIX . 'front-end',
				plugins_url( 'build/index.js', dirname( __FILE__ ) ),
				// jQuery is used for the ajax request, and wp-date is required for moment-timezone to work.
				$script_info['dependencies'],
				$script_info['version'],
				true
			);

			wp_register_style(
				'font-awesome',
				plugins_url( 'includes/font-awesome/css/font-awesome.min.css', dirname( __FILE__ ) ),
				array(),
				'3.2.1',
				'all'
			);

			wp_register_style(
				self::PREFIX . 'front-end',
				plugins_url( 'build/index.css', dirname( __FILE__ ) ),
				array( 'font-awesome' ),
				self::CACHE_BUST,
				'all'
			);

			// @todo Check if we're on tagregator page, if possible.
			if ( ! is_admin() ) {
				wp_enqueue_script( self::PREFIX . 'front-end' );
				wp_enqueue_style( self::PREFIX . 'front-end' );
			}
		}
	} // end Tagregator
}
