# Co-Locate Images

## The Problem

You want to store images with your content for example `content/posts/post-slug/image.jpg` but that path isn't part of your final build. You either have to move your images to a path under `public` which results in content being split, otherwise you need to base64 encode them as data urls.

## The Solution

`remark-plugin-colocate-images` fixes this by copying images from your content path to a spcified folder. Allowing you use `./image.jpg` in your markdown which gets replaced with `/img/image.jpg` in the compiled output.

# Usage

```
npm-install --save remark-plugin-colocate-images
```

Where ever you compile your markdown add a remark plugin like so:

```ts
import remark from 'remark'
import {colocateImagesPlugin} from "../remark-plugin-colocate-images"

const result = await remark()
  .use(colocateImagesPlugin({
    diskRoot: '/path/to/post/directory', // Where on the disk is the posts content, e.g. index.md and image.jpg
    diskReplace: '/path/to/public/directory/img', // Where on the disk should files be copied to
    urlReplace: '/img/', // Needs the trailing slash, replaces `./` in the image path.
  }))
  .process()
```

