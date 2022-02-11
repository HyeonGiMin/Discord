module.exports =(sequelize, DataTypes) => {
    //.define('테이블명',{ 속성명{ 속성값}....}
    return sequelize.define('Issues', {
        id: {
            type: DataTypes.STRING(45),
            allowNull: false,
            primaryKey:true,
            unique: true
        }, project: {
            type: DataTypes.STRING(45),
            allowNull: true,

        }, status: {
            type: DataTypes.STRING(45),
            allowNull: true,

        } ,tracker: {
            type: DataTypes.STRING(45),
            allowNull: true,

        }, priority: {
            type: DataTypes.STRING(45),
            allowNull: true,

        }, author: {
            type: DataTypes.STRING(45),
            allowNull: true,

        }, assigned_to: {
            type: DataTypes.STRING(45),
            allowNull: true,

        }, title: {
            type: DataTypes.STRING(500),
            allowNull: true,

        }, updated_on: {
            type: DataTypes.DATE,
            allowNull: true,

        }, createdAt: {
            type: DataTypes.DATE,
            allowNull: true,

        }, updatedAt: {
            type: DataTypes.DATE,
            allowNull: true,

        }
    }, {
        timestamps: true,
    });
};
