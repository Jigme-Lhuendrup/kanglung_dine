const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/config.js');

const Restaurant = sequelize.define('Restaurant', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true
    },
    ownerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: ''
    },
    address: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    phone: {
        type: DataTypes.STRING(20),
        allowNull: false
    },
    openingHours: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    image: {
        type: DataTypes.STRING(255),
        allowNull: true,
        defaultValue: null
    }
}, {
    tableName: 'restaurants',
    timestamps: true,
    underscored: false,
    schema: 'public',
    freezeTableName: true,
    indexes: [
        {
            unique: true,
            fields: ['name']
        },
        {
            fields: ['ownerId']
        }
    ]
});

// Add hooks to ensure proper relationship handling
Restaurant.addHook('beforeCreate', async (restaurant, options) => {
    // Verify that the owner exists
    const User = require('./User');
    const owner = await User.findByPk(restaurant.ownerId, { transaction: options.transaction });
    if (!owner) {
        throw new Error('Owner not found');
    }
    if (owner.role !== 'owner') {
        throw new Error('User must be a restaurant owner');
    }
});

module.exports = Restaurant; 