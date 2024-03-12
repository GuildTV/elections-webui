export default function(sequelize, DataTypes) {
  return sequelize.define('ElectionRound', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    electionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    round: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    results: {
      type: DataTypes.TEXT,
      allowNull: false,
    }
  }, {
    classMethods:{
      associate: function(models){
        models.ElectionRound.belongsTo(models.Election);
      }
    }
  });
}
