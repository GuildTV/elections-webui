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
        positionId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          unique: true,
          references: {
            model: "Positions",
            key: 'id',
            deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE
          },
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT'
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
