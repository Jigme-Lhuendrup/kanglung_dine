const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/config.js');

const User = sequelize.define('User', {
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
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    password: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    role: {
        type: DataTypes.STRING(10),
        allowNull: false,
        defaultValue: 'user',
        validate: {
            isIn: [['user', 'owner', 'admin']]
        }
    },
    bio: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    profilePicture: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    isVerified: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    verificationToken: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    tableName: 'users',
    timestamps: true,
    underscored: false,
    schema: 'public',
    freezeTableName: true
});

module.exports = User;