import { Table, Column, Model, HasMany, AllowNull, Unique, ForeignKey, DataType, BelongsTo } from 'sequelize-typescript'

export interface ElectionAttributes {
	id: number
	positionName: string
	candidates: string
}

export type ElectionCreationAttributes = Omit<ElectionAttributes, 'id'>

@Table
export class Election extends Model<ElectionAttributes, ElectionCreationAttributes> {
	@AllowNull(false)
	@Unique
	@Column
	declare positionName: string

	@AllowNull(false)
	@Column
	declare candidates: string

	@HasMany(() => ElectionRound)
	ElectionRounds!: ElectionRound[]
}

export interface ElectionRoundAttributes {
	id: number
	electionId: number
	round: number
	results: string
}

export type ElectionRoundCreationAttributes = Omit<ElectionRoundAttributes, 'id'>

@Table
export class ElectionRound extends Model<ElectionRoundAttributes, ElectionRoundCreationAttributes> {
	@ForeignKey(() => Election)
	@Column
	declare electionId: number

	@AllowNull(false)
	@Column(DataType.INTEGER)
	declare round: number

	@AllowNull(false)
	@Column
	declare results: string

	@BelongsTo(() => Election)
	Election!: Election
}
