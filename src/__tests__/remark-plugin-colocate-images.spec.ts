import fs from "fs";
import path from "path";
import remark from "remark";
import html from "remark-html";

import { colocateImagesPlugin } from "../remark-plugin-colocate-images";

const { readdir, unlink } = fs.promises;

describe("Co Locate Images", () => {
  const BASE_DIR = path.join(process.cwd(), "src", "__tests__");

  const clear = async () => {
    const files = await readdir(path.join(BASE_DIR, "results"));

    await Promise.all(
      files.map((file) => {
        if (file !== ".gitkeep") {
          return unlink(path.join(BASE_DIR, "results", file));
        }
      })
    );
  };

  beforeAll(async () => {
    await clear();
  });

  afterEach(async () => {
    await clear();
  });

  it("should copy images to the correct path", async () => {
    const markdown = `
![Image](./test.txt)

![External Image](http://example.com/image.jpg)
    `.trim();

    const plugin = colocateImagesPlugin({
      diskRoot: path.join(BASE_DIR, "samples"),
      diskReplace: path.join(BASE_DIR, "results"),
    });

    const result = await remark()
      .use(html)
      .use(plugin as any)
      .process(markdown);

    expect(result.toString()).toMatchInlineSnapshot(`
      "<p><img src=\\"/public/img/test.txt\\" alt=\\"Image\\"></p>
      <p><img src=\\"http://example.com/image.jpg\\" alt=\\"External Image\\"></p>
      "
    `);

    const exists = fs.existsSync(path.join(BASE_DIR, "results", "test.txt"));

    expect(exists).toBeTruthy();
  });
});
