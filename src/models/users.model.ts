// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.
import { Sequelize, DataTypes, Model } from 'sequelize';
import { Application } from '../declarations';
import { HookReturn } from 'sequelize/types/lib/hooks';

export enum UserRoles {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN ='ADMIN',
  USER ='USER'
}

export default function (app: Application): typeof Model {
  const sequelizeClient: Sequelize = app.get('sequelizeClient');
  const users = sequelizeClient.define('users', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
    },
    permissions: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      values: Object.values(UserRoles),
      defaultValue: [UserRoles.USER],
      allowNull: false,
    },
  }, {
    hooks: {
      beforeCount(options: any): HookReturn {
        options.raw = true;
      },
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  (users as any).associate = function (models: any): void {
    // Define associations here
    // See http://docs.sequelizejs.com/en/latest/docs/associations/
    users.hasMany(models.notifications);
  };

  return users;
}
