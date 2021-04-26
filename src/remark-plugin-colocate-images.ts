import fs from 'fs'
import path from 'path'
import visit from 'unist-util-visit'
import mkdirp from 'mkdirp'

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

export const colocateImagesPlugin = (
  pluginOptions: Partial<ColocateImagesPluginOptions> & {
    diskRoot?: string
    handleImage?: (src: string) => string | Promise<string>
  }
) => {
  const {search, urlReplace, diskRoot, diskReplace, handleImage} = Object.assign({}, defaultOptions, pluginOptions)

  return () => {
    return async (tree: any) => {
      const promises: Promise<any>[] = []

      const onImage = (node: any) => {
        if(!!node.url.match(search)){
          if(handleImage){
            const src = handleImage(node.url)

            if(typeof src === 'string'){
              node.url = src
            }else{
              promises.push(src.then((newSrc) => {
                node.url = newSrc
              }))
            }

            return
          }

          if(!diskRoot){
            throw new Error("`diskRoot` must be supplied if `handleImage` is not.")
          }

          const diskPath = path.resolve(diskRoot, node.url)
          const targetDiskPath = path.resolve(diskReplace, node.url)

          const promise = mkdirp(path.dirname(targetDiskPath))
            .then(() => copyFile(diskPath, targetDiskPath))

          promises.push(promise)

          node.url = node.url.replace(search, urlReplace)
        }
      }

      visit(tree, 'image', onImage)

      await Promise.all(promises)
    }
  }
}