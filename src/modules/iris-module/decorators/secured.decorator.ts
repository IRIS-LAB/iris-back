import { SetMetadata } from '@nestjs/common'
import { SECURED_METADATAS } from '../../../constants'

export const Secured = (function1: string, ...functions: string[]) => SetMetadata(SECURED_METADATAS, [function1, ...functions])
