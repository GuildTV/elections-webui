export default function(sequelize, DataTypes) {
  return sequelize.define('TickerEntry', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    enabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },

    text: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    order: {
      type: DataTypes.INTEGER,
      allowNull: false,
    }
  });
}
