# PixelDrop PHP Version

This package uses separate HTML, CSS, JavaScript, and PHP files.

## Files

- `index.html`: page structure
- `style.css`: design and mobile layout
- `script.js`: upload, gallery, lightbox, and delete controls
- `api.php`: server upload, listing, and deletion code
- `uploads/`: saved images

## Hosting Requirements

- PHP 8.1 or newer
- PHP Fileinfo extension enabled
- Apache or compatible PHP hosting
- Write permission for the `uploads` folder

## Installation

1. Extract the ZIP file.
2. Upload everything inside `pixeldrop-php` to your website folder.
3. Make sure the `uploads` folder is writable. Usually permission `755` works.
4. Open `index.html` in your browser.

## PHP Upload Limit

The website accepts images up to 10 MB, but your hosting company may have a
smaller PHP limit. If needed, set these values in `php.ini`:

```ini
upload_max_filesize = 12M
post_max_size = 12M
```

Some shared hosting services let you change these values in cPanel.

## Security

The PHP server checks the real file type, creates random stored filenames,
blocks unsupported formats, prevents folder-path deletion, and requires a
second confirmation before deleting an image.
