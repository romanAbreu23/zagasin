import { DataTypes } from "sequelize";
import db from '../config/db.js'

const Property = db.define('properties', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true
    },
    antiquity: {
        type: DataTypes.STRING(60),
        allowNull: false,
    },
    title: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    landArea: {
        type: DataTypes.DECIMAL,
        allowNull: false,
    },
    builtArea: {
        type: DataTypes.DECIMAL,
        allowNull: false,
    },
    realPrice: {
        type: DataTypes.DECIMAL,
        allowNull: false,
    },
    bedrooms: {
        type: DataTypes.STRING(25),
        allowNull: false
    },
    wc: {
        type: DataTypes.STRING(25),
        allowNull: false
    },
    garage: {
        type: DataTypes.STRING(25),
        allowNull: false
    },
    floors: {
        type: DataTypes.STRING(25),
        allowNull: false,
    },
    sellRent: {
        type: DataTypes.STRING(25),
        allowNull: false,
    },
    creditCash: {
        type: DataTypes.STRING(25),
        allowNull: false,
    },
    pets: {
        type: DataTypes.STRING(25),
        allowNull: false,
    },
    pool: {
        type: DataTypes.STRING(25),
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    contactName: {
        type: DataTypes.STRING(100),
        defaultValue: ''
    },
    contactTel: {
        type: DataTypes.STRING(100),
        defaultValue: ''
    },
    secondContactName: {
        type: DataTypes.STRING(100),
        defaultValue: ''
    },
    secondContactTel: {
        type: DataTypes.STRING(100),
        defaultValue: ''
    },
    exclusive: {
        type: DataTypes.STRING(25),
        defaultValue: ''
    },
    commission: {
        type: DataTypes.DECIMAL,
        defaultValue: 0
    },
    address: {
        type: DataTypes.STRING(200),
        allowNull: false
    },
    city: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    lat: {
        type: DataTypes.STRING,
        allowNull: false
    },
    lng: {
        type: DataTypes.STRING,
        allowNull: false
    },
    published: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    visible: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
});

export default Property;