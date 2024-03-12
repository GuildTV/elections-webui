import { Table, Column, Model, HasMany, AllowNull, Unique, ForeignKey, DataType, BelongsTo } from 'sequelize-typescript'

export enum PositionType {
	CandidateSabb = 'candidateSabb',
	CandidateNonSabb = 'candidateNonSabb',
	Other = 'other',
}

export interface PositionAttributes {
	id: number
	type: PositionType
	fullName: string
	compactName: string
	miniName: string
	order: number
	winnerOrder: number
	sidebarUseOfficer: boolean
}

export type PositionCreationAttributes = Omit<PositionAttributes, 'id'>

@Table
export class Position extends Model<PositionAttributes, PositionCreationAttributes> {
	@AllowNull(false)
	@Column(DataType.ENUM(PositionType.CandidateNonSabb, PositionType.CandidateSabb, PositionType.Other))
	declare type: PositionType

	@AllowNull(false)
	@Column
	declare fullName: string

	@AllowNull(false)
	@Column
	declare compactName: string

	@AllowNull(false)
	@Column
	declare miniName: string

	@AllowNull(false)
	@Column(DataType.INTEGER)
	declare order: number

	@AllowNull(false)
	@Column(DataType.INTEGER)
	declare winnerOrder: number

	@AllowNull(false)
	@Column
	declare sidebarUseOfficer: boolean

	@HasMany(() => Person)
	People!: Person[]
}

export interface PersonAttributes {
	id: number
	positionId: number
	firstName: string
	lastName: string
	firstName2: string | null
	lastName2: string | null
	photo: string
	manifestoOne: string
	manifestoTwo: string
	manifestoThree: string
	order: number
	elected: boolean
}

export type PersonCreationAttributes = Omit<PersonAttributes, 'id'>

@Table
export class Person extends Model<PersonAttributes, PersonCreationAttributes> {
	@ForeignKey(() => Position)
	@Column
	declare positionId: number

	@AllowNull(false)
	@Column
	declare firstName: string

	@AllowNull(false)
	@Column
	declare lastName: string

	@AllowNull(true)
	@Column(DataType.STRING)
	declare firstName2: string | null

	@AllowNull(true)
	@Column(DataType.STRING)
	declare lastName2: string | null

	@AllowNull(false)
	@Column(DataType.TEXT('long'))
	declare photo: string

	@AllowNull(false)
	@Column
	declare manifestoOne: string

	@AllowNull(false)
	@Column
	declare manifestoTwo: string

	@AllowNull(false)
	@Column
	declare manifestoThree: string

	@AllowNull(false)
	@Column(DataType.INTEGER)
	declare order: number

	@AllowNull(false)
	@Column
	declare elected: boolean

	@BelongsTo(() => Position)
	declare Position: Position
}
