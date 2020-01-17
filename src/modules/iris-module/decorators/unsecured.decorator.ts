import { SetMetadata } from '@nestjs/common'
import { UNSECURED_METADATAS } from '../../../constants'

export const Unsecured = () => SetMetadata(UNSECURED_METADATAS, true)
