import { Table, Column, Model, AllowNull, DataType } from 'sequelize-typescript'

export interface TickerEntryAttributes {
	id: number
	enabled: boolean
	text: string
	order: number
}

export type TickerEntryCreationAttributes = Omit<TickerEntryAttributes, 'id'>

@Table
export class TickerEntry extends Model<TickerEntryAttributes, TickerEntryCreationAttributes> {
	@AllowNull(false)
	@Column(DataType.BOOLEAN)
	declare enabled: boolean

	@AllowNull(false)
	@Column(DataType.STRING)
	declare text: string

	@AllowNull(false)
	@Column(DataType.INTEGER)
	declare order: number
}
