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

        positionId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: "Positions",
            key: 'id',
            deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },

        firstName: {
          type: Sequelize.STRING,
          allowNull: false
        },
        lastName: {
          type: Sequelize.STRING,
          allowNull: false
        },
        firstName2: {
          type: Sequelize.STRING,
          allowNull: true
        },
        lastName2: {
          type: Sequelize.STRING,
          allowNull: true
        },

        photo: {
          type: Sequelize.TEXT('long'),
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
