export default function(sequelize, DataTypes) {
  return sequelize.define('Person', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    positionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    firstName2: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    lastName2: {
      type: DataTypes.STRING,
      allowNull: true,
    },


    photo: {
      type: DataTypes.TEXT('long'),
      allowNull: false,
    },

    manifestoOne: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    manifestoTwo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    manifestoThree: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    order: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    elected: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    }
  }, {
    classMethods:{
      associate: function(models){
        models.Person.belongsTo(models.Position);
      }
    }
  });
}
