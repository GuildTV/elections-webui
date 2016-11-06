export default function(sequelize, DataTypes) {
  return sequelize.define('Election', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    positionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    candidates: {
      type: DataTypes.TEXT,
      allowNull: false,
    }
  }, {
    classMethods:{
      associate: function(models){
        models.Election.belongsTo(models.Position);
        models.Election.hasMany(models.ElectionRound);
      }
    }
  });
};
