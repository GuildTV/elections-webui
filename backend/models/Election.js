export default function(sequelize, DataTypes) {
  return sequelize.define('Election', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    positionName: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },

    candidates: {
      type: DataTypes.TEXT,
      allowNull: false,
    }
  }, {
    classMethods:{
      associate: function(models){
        models.Election.hasMany(models.ElectionRound);
      }
    }
  });
}
