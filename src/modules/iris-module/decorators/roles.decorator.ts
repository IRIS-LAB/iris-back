import { SetMetadata } from '@nestjs/common'
import { ROLES_METADATAS } from '../../../constants'

export const Roles = (...functions: string[]) => SetMetadata(ROLES_METADATAS, functions)
