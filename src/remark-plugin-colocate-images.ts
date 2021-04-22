import fs from 'fs'
import path from 'path'
import visit from 'unist-util-visit'

const {copyFile} = fs.promises

interface ColocateImagesPluginOptions{
  search: RegExp
  urlReplace: string
  diskReplace: string
}

const defaultOptions: ColocateImagesPluginOptions = {
  search: /^\.\//,
  urlReplace: '/public/img/',
  diskReplace: path.join(process.cwd(), 'public', 'img'),
}

export const colocateImagesPlugin = (pluginOptions: Partial<ColocateImagesPluginOptions> & {diskRoot: string}) => {
  const {search, urlReplace, diskRoot, diskReplace} = Object.assign({}, defaultOptions, pluginOptions)

  return () => {
    return async (tree: any) => {
      const promises: Promise<any>[] = []

      const onImage = (node: any) => {
        if(!!node.url.match(search)){
          const diskPath = path.resolve(diskRoot, node.url)
          const targetDiskPath = path.resolve(diskReplace, node.url)

          promises.push(copyFile(diskPath, targetDiskPath))

          node.url = node.url.replace(search, urlReplace)
        }
      }

      visit(tree, 'image', onImage)

      await Promise.all(promises)
    }
  }
}