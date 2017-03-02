export default function(sequelize, DataTypes) {
  return sequelize.define('Position', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },

    type: {
      type: DataTypes.ENUM('candidateSabb', 'candidateNonSabb', 'other'),
      allowNull: false,
    },

    fullName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    compactName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    miniName: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    order: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    winnerOrder: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    sidebarUseOfficer: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    }
  }, {
    classMethods:{
      associate: function(models){
        models.Position.hasMany(models.Person);
      }
    }
  });
}
