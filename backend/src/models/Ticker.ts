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
	@Column
	declare enabled: boolean

	@AllowNull(false)
	@Column
	declare text: string

	@AllowNull(false)
	@Column(DataType.INTEGER)
	declare order: number
}
