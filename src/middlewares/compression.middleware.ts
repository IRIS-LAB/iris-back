import compression from 'compression'

export const enableCompression = () => {
  return compression()
}
