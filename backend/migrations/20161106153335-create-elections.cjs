module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.createTable(
      'Elections',
      {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        positionName: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true,
        },

        candidates: {
          type: Sequelize.TEXT,
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
    return queryInterface.dropTable('Elections');
  }
};
