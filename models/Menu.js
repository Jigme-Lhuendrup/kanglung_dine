const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/config.js');

const Menu = sequelize.define('Menu', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    itemNo: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    itemName: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            min: 0
        },
        get() {
            const value = this.getDataValue('price');
            return value === null ? null : parseFloat(value);
        }
    },
    restaurantId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'restaurants',
            key: 'id'
        }
    }
}, {
    tableName: 'menus',
    timestamps: true,
    underscored: false,
    schema: 'public',
    freezeTableName: true,
    indexes: [
        {
            fields: ['restaurantId']
        },
        {
            fields: ['itemNo']
        }
    ]
});

module.exports = Menu; 