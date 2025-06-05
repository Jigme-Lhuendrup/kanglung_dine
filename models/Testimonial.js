const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/config.js');

const Testimonial = sequelize.define('Testimonial', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    rating: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
            min: 1,
            max: 5
        }
    }
}, {
    tableName: 'testimonials',
    timestamps: true,
    underscored: false,
    schema: 'public',
    freezeTableName: true
});

module.exports = Testimonial; 