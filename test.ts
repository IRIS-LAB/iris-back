const DEFAULT_CACHE_PUBLIC_KEY_ENABLED = false

// tslint:disable-next-line:no-console
console.log(`${((process.env.CACHE_PUBLIC_KEY_ENABLED as unknown) as boolean) || DEFAULT_CACHE_PUBLIC_KEY_ENABLED}`)
