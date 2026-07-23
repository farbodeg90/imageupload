# PixelDrop Image Uploader

PixelDrop is a complete image-upload website built with React, Next.js-compatible
routes, Vinext, Cloudflare Workers, and R2 object storage.

## Features

- Upload JPG, PNG, WebP, and GIF images
- Drag-and-drop file selection
- Mobile-friendly upload progress
- Automatic compression for large iPhone and mobile photos
- Permanent server-side image storage with Cloudflare R2
- Gallery of recently uploaded images
- In-page lightbox image viewer
- Confirmed permanent image deletion
- Responsive design for phones, tablets, and computers
- Keyboard-accessible controls

## Main Files

- `app/page.tsx`: uploader, mobile compression, gallery, lightbox, and deletion UI
- `app/globals.css`: complete responsive design
- `app/api/images/route.ts`: image listing and upload API
- `app/api/images/[key]/route.ts`: image viewing and deletion API
- `.openai/hosting.json`: Sites storage-binding example

## Requirements

- Node.js 22.13 or newer
- A Cloudflare R2 bucket exposed to the Worker as `BUCKET`
- npm

## Install

```bash
npm install
```

## Run Locally

The included Vite configuration creates a local R2 simulation:

```bash
npm run dev
```

Then open the address shown in the terminal.

## Build

```bash
npm run build
```

## Deploy with ChatGPT Sites

1. Create a new Site using the Vinext starter.
2. Copy this source code into that Site checkout.
3. Keep the generated `project_id` in `.openai/hosting.json`.
4. Set the R2 binding to `"BUCKET"`.
5. Deploy through the Sites checkpoint workflow.

The needed manifest shape is:

```json
{
  "d1": null,
  "project_id": "YOUR_GENERATED_SITE_PROJECT_ID",
  "r2": "BUCKET"
}
```

## Important Upload Limit

The hosting request limit is smaller than many iPhone photos. PixelDrop
automatically compresses large JPG, PNG, and WebP images in the browser before
uploading them. Animated GIF files larger than 800 KB are rejected because
compressing them would remove their animation.

## Storage and Deletion

Image bytes are stored in R2 under the `uploads/` prefix. The server validates
that prefix before allowing deletion. The interface also requires a second
confirmation before permanently deleting an image.

## Customize

- Change colors and layout in `app/globals.css`.
- Change the name and text in `app/page.tsx`.
- Change accepted formats or size rules near the top of `app/page.tsx` and
  `app/api/images/route.ts`.

## License

You may use and modify this code for your own projects.
