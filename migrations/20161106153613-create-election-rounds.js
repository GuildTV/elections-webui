module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.createTable(
      'ElectionRounds',
      {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        electionId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: "Elections",
            key: 'id',
            deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },

        round: {
          type: Sequelize.INTEGER,
          allowNull: false
        },

        results: {
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
    ).then(function(){
      return queryInterface.addIndex(
        'ElectionRounds',
        ['electionId', 'round'],
        {
          indexName: 'round_unique',
          indicesType: 'UNIQUE'
        }
      );
    });
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.dropTable('ElectionRounds');
  }
};
