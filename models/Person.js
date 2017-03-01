export default function(sequelize, DataTypes) {
  return sequelize.define('Person', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    uid: {
      type: DataTypes.STRING,
      unique: true
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
