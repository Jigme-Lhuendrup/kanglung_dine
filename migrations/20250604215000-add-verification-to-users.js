'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'isVerified', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    }, { schema: 'public' });

    await queryInterface.addColumn('users', 'verificationToken', {
      type: Sequelize.STRING,
      allowNull: true,
    }, { schema: 'public' });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('users', 'isVerified', { schema: 'public' });
    await queryInterface.removeColumn('users', 'verificationToken', { schema: 'public' });
  }
};