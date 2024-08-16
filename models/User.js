module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define("User", {
        name: {
            type: DataTypes.STRING(100),
            allowNull: false,
            validate: {
                len: [2,30],
                notEmpty: true
            }
        },
        email: {
            type: DataTypes.STRING(100),
            allowNull: false,
            validate: {
                isEmail: true,
                notEmpty: true
            }
        },
        pword: {
            type: DataTypes.STRING(255),
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        role: {
            type: DataTypes.CHAR(1),
            allowNull: false,
            validate: {
                notEmpty: true
            }
        }
    },
    {
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
        tableName: "users"
    });

    return User;
}