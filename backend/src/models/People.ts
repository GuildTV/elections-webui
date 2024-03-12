import { Table, Column, Model, HasMany, AllowNull, Unique, ForeignKey, DataType, BelongsTo } from 'sequelize-typescript'

export enum PositionType {
	CandidateSabb = 'candidateSabb',
	CandidateNonSabb = 'candidateNonSabb',
	Other = 'other',
}

@Table
export class Position extends Model<Position> {
	@AllowNull(false)
	@Column(DataType.ENUM(PositionType.CandidateNonSabb, PositionType.CandidateSabb, PositionType.Other))
	type!: PositionType

	@AllowNull(false)
	@Column
	fullName!: string

	@AllowNull(false)
	@Column
	compactName!: string

	@AllowNull(false)
	@Column
	miniName!: string

	@AllowNull(false)
	@Column(DataType.INTEGER)
	order!: number

	@AllowNull(false)
	@Column(DataType.INTEGER)
	winnerOrder!: number

	@AllowNull(false)
	@Column
	sidebarUseOfficer!: boolean

	@HasMany(() => Person)
	People!: Person[]
}

@Table
export class Person extends Model<Person> {
	@ForeignKey(() => Position)
	@Column
	positionId!: number

	@AllowNull(false)
	@Column
	firstName!: string

	@AllowNull(false)
	@Column
	lastName!: string

	@AllowNull(true)
	@Column
	firstName2!: string

	@AllowNull(true)
	@Column
	lastName2!: string

	@AllowNull(false)
	@Column(DataType.TEXT('long'))
	photo!: string

	@AllowNull(false)
	@Column
	manifestoOne!: string

	@AllowNull(false)
	@Column
	manifestoTwo!: string

	@AllowNull(false)
	@Column
	manifestoThree!: string

	@AllowNull(false)
	@Column(DataType.INTEGER)
	order!: number

	@AllowNull(false)
	@Column
	elected!: boolean

	@BelongsTo(() => Position)
	Position!: Position
}
