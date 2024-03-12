import { Table, Column, Model, HasMany, AllowNull, Unique, ForeignKey, DataType, BelongsTo } from 'sequelize-typescript'

@Table
export class Election extends Model<Election> {
	@AllowNull(false)
	@Unique
	@Column
	positionName!: string

	@AllowNull(false)
	@Column
	candidates!: string

	@HasMany(() => ElectionRound)
	ElectionRounds!: ElectionRound[]
}

@Table
export class ElectionRound extends Model<ElectionRound> {
	@ForeignKey(() => Election)
	@Column
	electionId!: number

	@AllowNull(false)
	@Column(DataType.INTEGER)
	round!: number

	@AllowNull(false)
	@Column
	candidates!: string

	@AllowNull(false)
	@Column
	results!: string

	@BelongsTo(() => Election)
	Election!: Election
}
