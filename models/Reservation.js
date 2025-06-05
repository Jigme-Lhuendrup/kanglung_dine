const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/config.js');

const Reservation = sequelize.define('Reservation', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    restaurantId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'restaurants',
            key: 'id'
        }
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    time: {
        type: DataTypes.TIME,
        allowNull: false
    },
    numberOfGuests: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1
        }
    },
    status: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'pending',
        validate: {
            isIn: [['pending', 'confirmed', 'rejected', 'cancelled', 'completed']]
        }
    },
    specialRequests: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: ''
    }
}, {
    tableName: 'reservations',
    timestamps: true,
    underscored: false,
    schema: 'public',
    freezeTableName: true,
    indexes: [
        {
            fields: ['userId']
        },
        {
            fields: ['restaurantId']
        },
        {
            fields: ['date']
        },
        {
            fields: ['status']
        }
    ]
});

module.exports = Reservation;