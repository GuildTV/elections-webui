module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.createTable(
      'People',
      {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        uid: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true
        },

        positionId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: "Positions",
            key: 'id',
            deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE
          },
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT'
        },

        firstName: {
          type: Sequelize.STRING,
          allowNull: false
        },
        lastName: {
          type: Sequelize.STRING,
          allowNull: false
        },

        photo: {
          type: Sequelize.TEXT,
          allowNull: true
        },

        manifestoOne: {
          type: Sequelize.STRING,
          allowNull: true
        },
        manifestoTwo: {
          type: Sequelize.STRING,
          allowNull: true
        },
        manifestoThree: {
          type: Sequelize.STRING,
          allowNull: true
        },

        order: {
          type: Sequelize.INTEGER,
          allowNull: false
        },

        elected: {
          type: Sequelize.BOOLEAN,
          allowNull: false
        },

        createdAt: {
          type: Sequelize.DATE
        },
        updatedAt: {
          type: Sequelize.DATE
        }
      },{
        charset: 'utf8'
      }
    );
  },

  down: function (queryInterface) {
    return queryInterface.dropTable('People');
  }
};
