import moment from 'moment'
import { Repository, SelectQueryBuilder } from 'typeorm'
import { ObjectLiteral } from 'typeorm/common/ObjectLiteral'
import { EntityFilter } from '../interfaces'
import { TypeormUtils } from './typeorm.utils'

export class TypeormQueryBuilder<T> {
  public readonly mainAliase: string
  public readonly relations: { [propertyPath: string]: { selectPath: string, aliase: string, shouldSelectEntities: boolean } } = {}
  public sort: Array<{ propertyPath: string, direction: 'ASC' | 'DESC' }> = []
  public filters: Array<{ where: string, parameters?: ObjectLiteral }> = []
  private offset: number | undefined
  private limit: number | undefined
  private filterParameterIndex = 0

  constructor(private readonly repository: Repository<T>) {
    this.mainAliase = this.buildMainAliase()
  }

  public getSelectQueryBuilder(): SelectQueryBuilder<T> {
    let selectQueryBuilder = this.repository.createQueryBuilder(this.mainAliase)
    for (const relation of Object.values(this.relations)) {
      selectQueryBuilder = relation.shouldSelectEntities ? selectQueryBuilder.leftJoinAndSelect(relation.selectPath, relation.aliase) : selectQueryBuilder.leftJoin(relation.selectPath, relation.aliase)
    }
    for (const filter of this.filters) {
      selectQueryBuilder = this.filters.indexOf(filter) === 0 ? selectQueryBuilder.where(filter.where, filter.parameters) : selectQueryBuilder.andWhere(filter.where, filter.parameters)
    }
    for (const sortField of this.sort) {
      selectQueryBuilder = selectQueryBuilder.addOrderBy(sortField.propertyPath, sortField.direction)
    }
    if (this.offset !== undefined) {
      selectQueryBuilder = selectQueryBuilder.offset(this.offset)
    }
    if (this.limit !== undefined) {
      selectQueryBuilder = selectQueryBuilder.limit(this.limit)
    }
    return selectQueryBuilder
  }

  public withFilter(propertyPath: string, value: EntityFilter) {
    this.withRelationToField(propertyPath)

    if (value === null) {
      this.filters.push({ where: `${this.getQueryBuilderFieldAccessor(propertyPath)} IS NULL` })
    } else if (typeof value === 'object') {
      for (const operator of Object.keys(value)) {
        let operatorValue = value[operator]
        if (operatorValue !== undefined) {
          if (operatorValue instanceof Date) {
            operatorValue = moment(operatorValue).toISOString()
          }
          const filterParameterName = this.getFilterParameterName()

          switch (operator) {
            case 'lt':
              this.filters.push({
                where: `${this.getQueryBuilderFieldAccessor(propertyPath)} < :${filterParameterName}`,
                parameters: { [filterParameterName]: operatorValue },
              })
              break
            case 'lte':
              this.filters.push({
                where: `${this.getQueryBuilderFieldAccessor(propertyPath)} <= :${filterParameterName}`,
                parameters: { [filterParameterName]: operatorValue },
              })
              break
            case 'gt':
              this.filters.push({
                where: `${this.getQueryBuilderFieldAccessor(propertyPath)} > :${filterParameterName}`,
                parameters: { [filterParameterName]: operatorValue },
              })
              break
            case 'gte':
              this.filters.push({
                where: `${this.getQueryBuilderFieldAccessor(propertyPath)} >= :${filterParameterName}`,
                parameters: { [filterParameterName]: operatorValue },
              })
              break
            case 'eq':
              this.filters.push({
                where: `${this.getQueryBuilderFieldAccessor(propertyPath)} = :${filterParameterName}`,
                parameters: { [filterParameterName]: operatorValue },
              })
              break
            case 'ne':
              this.filters.push({
                where: `${this.getQueryBuilderFieldAccessor(propertyPath)} <> :${filterParameterName}`,
                parameters: { [filterParameterName]: operatorValue },
              })
              break
            case 'in':
              this.filters.push({
                where: `${this.getQueryBuilderFieldAccessor(propertyPath)} = ANY(:${filterParameterName})`,
                parameters: { [filterParameterName]: Array.isArray(operatorValue) ? operatorValue : [operatorValue] },
              })
              break
            case 'nin':
              this.filters.push({
                where: `NOT ${this.getQueryBuilderFieldAccessor(propertyPath)} = ANY(:${filterParameterName})`,
                parameters: { [filterParameterName]: Array.isArray(operatorValue) ? operatorValue : [operatorValue] },
              })
              break
            case 'like':
              this.filters.push({
                where: `${this.getQueryBuilderFieldAccessor(propertyPath)} LIKE :${filterParameterName}`,
                parameters: { [filterParameterName]: operatorValue },
              })
              break
          }
        }
      }
    } else {
      const filterParameterName = this.getFilterParameterName()
      this.filters.push({
        where: `${this.getQueryBuilderFieldAccessor(propertyPath)}  = :${filterParameterName}`,
        parameters: { [filterParameterName]: value },
      })
    }
    return this
  }

  public withRelationToField(propertyPath: string, shouldSelectEntities: boolean = false) {
    if (!this.relations.hasOwnProperty(propertyPath)) {
      const keyPathArray: string[] = []
      for (const keyPart of propertyPath.split('.')) {
        keyPathArray.push(keyPart)
        const tempPropertyPath = keyPathArray.join('.')
        if (TypeormUtils.isRelationValid(this.repository, tempPropertyPath)) {
          // add left join
          const metadata = TypeormUtils.getTypeormRelation(this.repository, tempPropertyPath)
          if (metadata) {
            if (!this.relations.hasOwnProperty(tempPropertyPath)) {
              this.relations[tempPropertyPath] = {
                selectPath: this.getQueryBuilderFieldAccessor(tempPropertyPath),
                aliase: this.getQueryBuilderJoinAlias(tempPropertyPath),
                shouldSelectEntities,
              }
            }
          }
        }
      }
    }
    return this
  }

  public withOrderBy(sort: { [propertyPath: string]: 'ASC' | 'DESC' }) {
    for (const propertyPath of Object.keys(sort)) {
      this.withRelationToField(propertyPath)
      this.sort.push({ propertyPath: this.getQueryBuilderFieldAccessor(propertyPath), direction: sort[propertyPath] })
    }
    return this
  }

  public withOffset(offset: number): this {
    this.offset = offset
    return this
  }

  public withLimit(limit: number): this {
    this.limit = limit
    return this
  }

  public getQueryBuilderJoinAlias(propertyPath: string) {
    return propertyPath.split('.').join('_')
  }

  public getQueryBuilderFieldAccessor(propertyPath: string): string {
    let aliase: string | undefined
    const propertyPathLess: string[] = []
    const propertySplitted = propertyPath.split('.')
    let i = propertySplitted.length - 1
    while (i >= 0 && aliase === undefined) {
      const propertyToCheck = propertySplitted.slice(0, i + 1).join('.')
      if (this.relations.hasOwnProperty(propertyToCheck)) {
        aliase = this.relations[propertyToCheck].aliase
      } else {
        propertyPathLess.unshift(propertySplitted [i])
        i--
      }
    }
    const resultArray: string[] = [aliase || this.mainAliase, ...propertyPathLess]
    return resultArray.join('.')
  }

  private getFilterParameterName() {
    return 'value' + this.filterParameterIndex++
  }

  private buildMainAliase(): string {
    let mainAliase = typeof this.repository.target === 'function' ? this.repository.target.name : this.repository.target
    if (mainAliase.length >= 1) {
      mainAliase = mainAliase.substring(0, 1).toLowerCase() + mainAliase.substr(1)
    }
    mainAliase = mainAliase.replace(new RegExp('^(.+)(?:Entity|EntityPart|XBE|([^X])BE|BEP|DTO)$'), '$1$2')
    return mainAliase
  }
}