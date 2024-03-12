module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.createTable(
      'TickerEntries',
      {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },

        enabled: {
          type: Sequelize.BOOLEAN,
          allowNull: false
        },

        text: {
          type: Sequelize.TEXT,
          allowNull: false,
        },

        order: {
          type: Sequelize.INTEGER,
          allowNull: false,
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
    return queryInterface.dropTable('TickerEntries');
  }
};
