import { Table, Column, Model, AllowNull, DataType } from 'sequelize-typescript'

@Table
export class TickerEntry extends Model<TickerEntry> {
	@AllowNull(false)
	@Column
	enabled!: boolean

	@AllowNull(false)
	@Column
	text!: string

	@AllowNull(false)
	@Column(DataType.INTEGER)
	order!: number
}
