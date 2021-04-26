import fs from 'fs'
import path from 'path'
import remark from 'remark'
import html from 'remark-html'
import rimraf from 'rimraf'
import mkdirp from 'mkdirp'

import {colocateImagesPlugin} from '../remark-plugin-colocate-images'

describe("Co Locate Images", () => {
  const BASE_DIR = path.join(process.cwd(), 'src', '__tests__')

  const clear = async () => {
    if(fs.existsSync(path.join(BASE_DIR, 'results'))){
      await new Promise<void>((resolve) => {
        rimraf(path.join(BASE_DIR, 'results'), () => {
          resolve()
        })
      })
    }

    await mkdirp(path.join(BASE_DIR, 'results'))
  }

  beforeAll(async () => {
    await clear()
  })

  afterEach(async () => {
    await clear()
  })

  it('should copy images to the correct path', async () => {
    const markdown = `
![Image](./test.txt)

![External Image](http://example.com/image.jpg)
    `.trim()

    const plugin = colocateImagesPlugin({
      diskRoot: path.join(BASE_DIR, 'samples'),
      diskReplace: path.join(BASE_DIR, 'results'),
    })

    const result = await remark()
      .use(html)
      .use(plugin)
      .process(markdown)

    expect(result.toString()).toMatchInlineSnapshot(`
      "<p><img src=\\"/public/img/test.txt\\" alt=\\"Image\\"></p>
      <p><img src=\\"http://example.com/image.jpg\\" alt=\\"External Image\\"></p>
      "
    `)

    const exists = fs.existsSync(path.join(BASE_DIR, 'results', 'test.txt'))

    expect(exists).toBeTruthy()
  })

  it('should create directories as needed', async () => {
    const markdown = `
![Image](./test.txt)
    `.trim()

    const plugin = colocateImagesPlugin({
      diskRoot: path.join(BASE_DIR, 'samples'),
      diskReplace: path.join(BASE_DIR, 'results', 'sample-post'),
    })

    await remark()
      .use(plugin)
      .process(markdown)

    const exists = fs.existsSync(
      path.join(BASE_DIR, 'results', 'sample-post', 'test.txt')
    )

    expect(exists).toBeTruthy()
  })

  it('should require `diskRoot` if `handleImage` is not supplied', async () => {
    const plugin = colocateImagesPlugin({})

    await expect(
      remark().use(plugin).process(`![Sample](./text.txt)`)
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `"\`diskRoot\` must be supplied if \`handleImage\` is not."`
    )
  })

  it('should support a handleImage function', async () => {
    const handleImage = (src: string) => {
      return "/test/passed.jpg"
    }

    const markdown = `
![Image](./test.txt)
    `.trim()

    const plugin = colocateImagesPlugin({
      diskRoot: path.join(BASE_DIR, 'samples'),
      diskReplace: path.join(BASE_DIR, 'results'),
      handleImage,
    })

    const result = await remark()
      .use(plugin)
      .use(html)
      .process(markdown)

    expect(result.toString()).toMatchInlineSnapshot(`
    "<p><img src=\\"/test/passed.jpg\\" alt=\\"Image\\"></p>
    "
  `)

    const exists = fs.existsSync(path.join(BASE_DIR, 'results', 'test.txt'))

    expect(exists).not.toBeTruthy()

    const asyncPlugin = colocateImagesPlugin({
      diskRoot: path.join(BASE_DIR, "samples"),
      diskReplace: path.join(BASE_DIR, "results"),
      handleImage: (src: string) =>
        new Promise((resolve) => resolve(handleImage(src))),
    })

    const asyncResult = await remark()
      .use(asyncPlugin)
      .use(html)
      .process(markdown)

    expect(asyncResult.toString()).toMatchInlineSnapshot(`
      "<p><img src=\\"/test/passed.jpg\\" alt=\\"Image\\"></p>
      "
    `)
  })
})
