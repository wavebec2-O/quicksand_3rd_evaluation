import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../utils/db";
import User from "./user.model";

export interface ThreadAttributes {
  id: string;
  title: string;
  userId: string;
  content: string;
}

interface ThreadCreationAttributes extends Optional<ThreadAttributes, "id"> {}

class Thread
  extends Model<ThreadAttributes, ThreadCreationAttributes>
  implements ThreadAttributes
{
  public id!: string;
  public title!: string;
  public content!: string;
  public userId!: string;
}

Thread.init(
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    userId: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
  },
  {
    sequelize,
    tableName: "threads",
    timestamps: true,
  }
);

Thread.belongsTo(User, { foreignKey: "userId", as: "user", constraints: true });
User.hasMany(Thread, {
  foreignKey: "userId",
  as: "threads",
  constraints: true,
});

export default Thread;
