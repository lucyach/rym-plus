// Dark Mode Feature
// Toggles the data-rym-plus-dark attribute on <html>.
// All dark-mode CSS lives in styles.css under html[data-rym-plus-dark],
// which is loaded by Chrome before any JS runs, so it applies instantly.

/* ---- public API ---- */

function handleDarkMode() {
  chrome.storage.sync.get(['darkMode'], function (result) {
    toggleDarkMode(result.darkMode === true);
  });
}

function toggleDarkMode(enable) {
  if (enable) {
    document.documentElement.setAttribute('data-rym-plus-dark', 'true');
  } else {
    document.documentElement.removeAttribute('data-rym-plus-dark');
  }
}

window.RYMPlusFeatures = window.RYMPlusFeatures || {};
window.RYMPlusFeatures.darkMode = {
  handle: handleDarkMode,
  toggle: toggleDarkMode,
};

// ---- Everything below is kept for reference only and is NOT executed ----
// (The old CSS-variable injection approach is replaced by styles.css)
const _UNUSED_DARK_MODE_CSS_REFERENCE = `
  /* =========================================================
     RYM Plus Dark Mode - Catppuccin Mocha-inspired palette
     ========================================================= */

  :root {
    --dm-bg:           #1e1e2e;
    --dm-bg-alt:       #181825;
    --dm-surface:      #313244;
    --dm-surface-alt:  #24273a;
    --dm-elevated:     #45475a;
    --dm-border:       #585b70;
    --dm-text:         #cdd6f4;
    --dm-text-muted:   #a6adc8;
    --dm-text-subtle:  #7f849c;
    --dm-link:         #89b4fa;
    --dm-link-hover:   #b4d0fd;
    --dm-link-visited: #cba6f7;
    --dm-yellow:       #f9e2af;
    --dm-green:        #a6e3a1;
    --dm-red:          #f38ba8;
    --dm-teal:         #94e2d5;
    --dm-overlay:      rgba(30, 30, 46, 0.85);
  }

  /* ---- GLOBAL ---- */
  html, body {
    background-color: var(--dm-bg) !important;
    color: var(--dm-text) !important;
  }

  /* ---- HEADER ---- */
  #header, #header_main, #headerwrap, .page_header_area {
    background-color: var(--dm-bg-alt) !important;
    border-bottom: 1px solid var(--dm-border) !important;
    color: var(--dm-text) !important;
  }

  /* RYM logo - invert to look good on dark bg */
  #logo img, .header_logo img, a.logo img {
    filter: brightness(1.4) !important;
  }

  /* Top navigation / navlinks */
  #navwrap, .navlinks, .navlinks_section, ul.navlinks {
    background-color: var(--dm-bg-alt) !important;
    border-color: var(--dm-border) !important;
  }

  .navlinks li a, .navlinks a, ul.navlinks > li > a,
  #navwrap a, .header_user_links a {
    color: var(--dm-text-muted) !important;
    background-color: transparent !important;
  }

  .navlinks li a:hover, .navlinks a:hover, ul.navlinks > li > a:hover {
    color: var(--dm-text) !important;
    background-color: var(--dm-surface) !important;
  }

  .navlinks li.selected a, .navlinks li.active a, .navlinks_selected a {
    color: var(--dm-link) !important;
    background-color: var(--dm-surface) !important;
  }

  /* Header search bar */
  #header_searchbar, .search_box, form.search_bar {
    background-color: var(--dm-surface) !important;
    border-color: var(--dm-border) !important;
  }

  #header_searchbar input, .search_box input, input[name="searchterm"],
  input[name="search_term"] {
    background-color: var(--dm-surface) !important;
    color: var(--dm-text) !important;
    border-color: var(--dm-border) !important;
  }

  /* Header user info / notification links */
  .header_links, .header_user_info, .header_notification_links,
  .header_links a, .header_user_info a {
    color: var(--dm-text-muted) !important;
  }

  /* ---- MAIN PAGE CONTAINER ---- */
  #page, #main_body, #main_interior, #main_column,
  #content, .page_content, .page_body, .main_page_content {
    background-color: var(--dm-bg) !important;
    color: var(--dm-text) !important;
  }

  /* ---- SECTIONS ---- */
  .section_outer, .section_outer_wide, .page_section,
  .section_top, .section_middle, .section_bottom {
    background-color: var(--dm-surface-alt) !important;
    border-color: var(--dm-border) !important;
    color: var(--dm-text) !important;
  }

  .section_inner, .section_body {
    background-color: var(--dm-surface-alt) !important;
    color: var(--dm-text) !important;
  }

  .section_header, .section_header_outer, .section_header_inner,
  .section_title, h2.section_header {
    background-color: var(--dm-bg-alt) !important;
    color: var(--dm-text) !important;
    border-bottom: 1px solid var(--dm-border) !important;
  }

  /* ---- LINKS ---- */
  a {
    color: var(--dm-link) !important;
  }
  a:visited {
    color: var(--dm-link-visited) !important;
  }
  a:hover {
    color: var(--dm-link-hover) !important;
  }

  /* Preserve image link appearance */
  a img {
    opacity: 0.92;
  }
  a:hover img {
    opacity: 1;
  }

  /* ---- ALBUM / RELEASE PAGE ---- */
  .release_page, .album_page, .page_release_main,
  .release_page_header, .release_page_main {
    background-color: var(--dm-bg) !important;
    color: var(--dm-text) !important;
  }

  .release_primary_image_container {
    background-color: var(--dm-surface) !important;
  }

  /* Album cover border */
  .coverart, .coverart img, .album_art, .release_cover {
    border-color: var(--dm-border) !important;
  }

  /* Release details / info box */
  .release_right_column, .release_info, .release_detail_line,
  .release_right_data, .page_release_rightcolumn {
    background-color: var(--dm-bg) !important;
    color: var(--dm-text) !important;
  }

  .release_detail_line .release_detail_value {
    color: var(--dm-text) !important;
  }

  /* Overall release rating */
  .release_rating, .album_page_rating, .avg_rating_outer,
  .page_release_ratings, .release_avg_rating {
    background-color: var(--dm-surface) !important;
    border-color: var(--dm-border) !important;
    color: var(--dm-yellow) !important;
  }

  .ratingscore, .avg_rating_num, .release_avg_num {
    color: var(--dm-yellow) !important;
  }

  /* Ratings count / distribution */
  .rating_popularity_table, .rating_distribution,
  .release_rating_count, .num_ratings {
    color: var(--dm-text-muted) !important;
  }

  /* Rating bar backgrounds */
  .rating_bar_wrapper, .rating_bar_outer {
    background-color: var(--dm-elevated) !important;
  }

  /* Track listing */
  table.mbgen.tracklist, .tracklisting, .tracklist,
  .track_listing, .discs_list {
    background-color: var(--dm-surface-alt) !important;
  }

  .tracklist_line, .track_row, .tracklisting tr {
    border-bottom: 1px solid var(--dm-border) !important;
    color: var(--dm-text) !important;
  }

  .tracklist_line:nth-child(even), .tracklisting tr:nth-child(even) {
    background-color: var(--dm-bg-alt) !important;
  }

  .tracklist_line:hover, .tracklisting tr:hover {
    background-color: var(--dm-elevated) !important;
  }

  /* ---- CHART / LIST VIEW ---- */
  .chart_results, .chartlist, .ooookiig, .list_results {
    background-color: var(--dm-surface-alt) !important;
    border-color: var(--dm-border) !important;
  }

  .chart_item, .chart_item_content, .page_chart_row,
  tr.selectable, .list_item {
    background-color: var(--dm-surface-alt) !important;
    border-bottom: 1px solid var(--dm-border) !important;
    color: var(--dm-text) !important;
  }

  .chart_item:hover, tr.selectable:hover, .list_item:hover,
  tr.selectable.selected {
    background-color: var(--dm-elevated) !important;
  }

  .chartlist_rating, .chart_position, .list_rank {
    color: var(--dm-yellow) !important;
  }

  .chart_position_num, .chart_position_prior {
    color: var(--dm-text-muted) !important;
  }

  /* ---- TABLES (general) ---- */
  table, table.mbgen, table.stats, table.list_table,
  table.page_charts, .table_plain {
    background-color: var(--dm-surface-alt) !important;
    border-color: var(--dm-border) !important;
    color: var(--dm-text) !important;
  }

  table th, table.mbgen th, table.stats th,
  thead th, .table_header th {
    background-color: var(--dm-bg-alt) !important;
    color: var(--dm-text) !important;
    border-color: var(--dm-border) !important;
  }

  table td, table.mbgen td, table.stats td {
    background-color: var(--dm-surface-alt) !important;
    color: var(--dm-text) !important;
    border-color: var(--dm-border) !important;
  }

  table tr:nth-child(even) td, table.mbgen tr.even td {
    background-color: var(--dm-bg-alt) !important;
  }

  table tr:hover td {
    background-color: var(--dm-elevated) !important;
  }

  /* ---- SIDEBAR ---- */
  #sidebar, .sidebar, .page_sidebar, .page_right_col,
  .sidebar_box, .sidebar_section {
    background-color: var(--dm-surface-alt) !important;
    border-color: var(--dm-border) !important;
    color: var(--dm-text) !important;
  }

  .sidebar_box_header, .sidebar_box_title {
    background-color: var(--dm-bg-alt) !important;
    color: var(--dm-text) !important;
    border-bottom: 1px solid var(--dm-border) !important;
  }

  /* ---- ALBUM BLOCKS (grid / list) ---- */
  .albumblock, .album_block, .page_section_media,
  .new_music_item, .featured_release {
    background-color: var(--dm-surface) !important;
    border-color: var(--dm-border) !important;
    color: var(--dm-text) !important;
  }

  .albumblock:hover, .album_block:hover {
    background-color: var(--dm-elevated) !important;
  }

  /* ---- GENRE / TAG PILLS ---- */
  .genre_link, .tag_link, .genre_tag, .tag,
  a.genre_link, a.tag_link {
    background-color: var(--dm-surface) !important;
    color: var(--dm-link) !important;
    border: 1px solid var(--dm-border) !important;
    border-radius: 3px;
  }

  a.genre_link:hover, a.tag_link:hover, .genre_link:hover {
    background-color: var(--dm-elevated) !important;
    color: var(--dm-link-hover) !important;
  }

  /* ---- FORMS & INPUTS ---- */
  input[type="text"], input[type="search"], input[type="email"],
  input[type="password"], input[type="url"], input[type="number"],
  input[type="tel"], select, textarea, .input_text,
  .form_input, .form_textarea {
    background-color: var(--dm-surface) !important;
    color: var(--dm-text) !important;
    border: 1px solid var(--dm-border) !important;
  }

  input::placeholder, textarea::placeholder {
    color: var(--dm-text-subtle) !important;
    opacity: 1 !important;
  }

  select option {
    background-color: var(--dm-surface) !important;
    color: var(--dm-text) !important;
  }

  /* Checkboxes / radios - leave browser-default, just fix label color */
  label {
    color: var(--dm-text) !important;
  }

  /* Form rows / wrappers */
  .form_row, .form_section, .form_group {
    background-color: var(--dm-surface-alt) !important;
    border-color: var(--dm-border) !important;
    color: var(--dm-text) !important;
  }

  /* ---- BUTTONS ---- */
  .btn, .btn_small, input[type="submit"], input[type="button"],
  input[type="reset"], button {
    background-color: var(--dm-surface) !important;
    color: var(--dm-text) !important;
    border: 1px solid var(--dm-border) !important;
  }

  .btn:hover, .btn_small:hover, input[type="submit"]:hover,
  input[type="button"]:hover, button:hover {
    background-color: var(--dm-elevated) !important;
    color: var(--dm-text) !important;
  }

  /* Preserve RYM Plus styled blue buttons */
  .blue_btn, .btn.blue_btn {
    background-color: #1e5399 !important;
    color: #fff !important;
    border-color: #1e5399 !important;
  }

  .blue_btn:hover, .btn.blue_btn:hover {
    background-color: #2a6bb3 !important;
  }

  /* ---- RATING STARS ---- */
  .rating_stars, .star_rating, .userrating,
  img.star_rating_image {
    color: var(--dm-yellow) !important;
    filter: none !important;
  }

  /* ---- SHOUTBOX / COMMENTS ---- */
  .shoutbox, .shoutbox_wrapper, .shoutbox_container,
  .shoutbox_content, .shoutbox_body, #shoutbox {
    background-color: var(--dm-surface-alt) !important;
    border-color: var(--dm-border) !important;
    color: var(--dm-text) !important;
  }

  .shout, .shout_row, .shoutbox_shout,
  .comment, .comment_row, .comment_item {
    background-color: var(--dm-surface-alt) !important;
    border-bottom: 1px solid var(--dm-border) !important;
    color: var(--dm-text) !important;
  }

  .shout:nth-child(even), .comment:nth-child(even) {
    background-color: var(--dm-bg-alt) !important;
  }

  .shout:hover, .comment:hover {
    background-color: var(--dm-elevated) !important;
  }

  /* ---- PROFILE PAGES ---- */
  .profile_header, .user_header, .page_user_main_box {
    background-color: var(--dm-surface) !important;
    border-color: var(--dm-border) !important;
    color: var(--dm-text) !important;
  }

  .profile_details, .user_info, .user_detail {
    background-color: var(--dm-surface-alt) !important;
    color: var(--dm-text) !important;
  }

  .profile_count_title {
    color: var(--dm-text-muted) !important;
  }

  .profile_count_value {
    color: var(--dm-yellow) !important;
  }

  /* ---- CATALOGUE / ARTIST PAGE ---- */
  .artist_main_image, .page_artist_main_box {
    background-color: var(--dm-surface) !important;
    border-color: var(--dm-border) !important;
  }

  .artist_info, .artist_detail, .artist_details {
    background-color: var(--dm-surface-alt) !important;
    color: var(--dm-text) !important;
  }

  /* ---- NEW MUSIC PAGE ---- */
  .page_home_content, .home_page_content,
  .new_releases, .new_music_list {
    background-color: var(--dm-bg) !important;
    color: var(--dm-text) !important;
  }

  /* ---- FEATURED / HIGHLIGHT BOXES ---- */
  .featured_box, .featured_box_inner, .highlight_box,
  .callout, .notice_box {
    background-color: var(--dm-surface) !important;
    border-color: var(--dm-border) !important;
    color: var(--dm-text) !important;
  }

  /* ---- PAGINATION ---- */
  .navbox, .pagination, .nav_pages, .page_links {
    background-color: var(--dm-surface-alt) !important;
    border-color: var(--dm-border) !important;
    color: var(--dm-text) !important;
  }

  .navbox a, .pagination a, .nav_pages a {
    color: var(--dm-link) !important;
  }

  .navbox a.selected, .navbox a:hover,
  .pagination a.selected, .pagination a:hover {
    background-color: var(--dm-elevated) !important;
    color: var(--dm-text) !important;
  }

  /* ---- FOOTER ---- */
  #footer, .footer, .page_footer {
    background-color: var(--dm-bg-alt) !important;
    border-top: 1px solid var(--dm-border) !important;
    color: var(--dm-text-muted) !important;
  }

  #footer a, .footer a {
    color: var(--dm-text-subtle) !important;
  }

  #footer a:hover, .footer a:hover {
    color: var(--dm-link) !important;
  }

  /* ---- DIVIDERS ---- */
  hr {
    border-color: var(--dm-border) !important;
    background-color: var(--dm-border) !important;
  }

  /* ---- MODAL / OVERLAY ---- */
  .modal, .overlay, .lightbox, .popup_wrapper,
  .modal_content, .dialog_inner {
    background-color: var(--dm-surface) !important;
    border-color: var(--dm-border) !important;
    color: var(--dm-text) !important;
  }

  .modal_overlay, .lightbox_overlay {
    background-color: var(--dm-overlay) !important;
  }

  /* ---- TOOLTIPS ---- */
  .tooltip, .ui-tooltip, [data-tooltip]:after {
    background-color: var(--dm-surface) !important;
    color: var(--dm-text) !important;
    border-color: var(--dm-border) !important;
  }

  /* ---- FORUM / BOARD PAGES ---- */
  .forum_thread, .board_thread, .thread_row,
  .post, .post_body, .forum_post {
    background-color: var(--dm-surface-alt) !important;
    border-color: var(--dm-border) !important;
    color: var(--dm-text) !important;
  }

  .thread_row:nth-child(even), .post:nth-child(even) {
    background-color: var(--dm-bg-alt) !important;
  }

  .forum_header, .board_header, .post_header {
    background-color: var(--dm-bg-alt) !important;
    color: var(--dm-text-muted) !important;
    border-bottom: 1px solid var(--dm-border) !important;
  }

  /* ---- SCROLLBAR ---- */
  ::-webkit-scrollbar {
    width: 10px;
    background-color: var(--dm-bg-alt);
  }

  ::-webkit-scrollbar-track {
    background-color: var(--dm-bg-alt);
  }

  ::-webkit-scrollbar-thumb {
    background-color: var(--dm-elevated);
    border-radius: 5px;
    border: 2px solid var(--dm-bg-alt);
  }

  ::-webkit-scrollbar-thumb:hover {
    background-color: var(--dm-border);
  }

  /* ---- SELECTION ---- */
  ::selection {
    background-color: #364273 !important;
    color: #cdd6f4 !important;
  }
`;
