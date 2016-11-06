module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.createTable(
      'Positions',
      {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        sabbGraphId: {
          type: Sequelize.STRING,
          allowNull: true
        },

        type: {
          type: Sequelize.ENUM('candidateSabb', 'candidateNonSabb', 'other'),
          allowNull: false
        },

        fullName: {
          type: Sequelize.STRING,
          allowNull: false
        },
        compactName: {
          type: Sequelize.STRING,
          allowNull: false
        },
        miniName: {
          type: Sequelize.STRING,
          allowNull: false
        },

        order: {
          type: Sequelize.INTEGER,
          allowNull: false
        },
        winnerOrder: {
          type: Sequelize.INTEGER,
          allowNull: false
        },

        sidebarUseOfficer: {
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

  down: function (queryInterface, Sequelize) {
    return queryInterface.dropTable('Positions');
  }
};
