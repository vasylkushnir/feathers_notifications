import { Service, SequelizeServiceOptions } from 'feathers-sequelize';
import { Application } from '../../declarations';
import {Paginated, Params, Query} from "@feathersjs/feathers";

export class Notifications extends Service {
  //eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options);
  }
  // find(params?: Params): Promise<any | any[] | Paginated<any>> {
  //   console.log(params);
  //
  //   return super.find({});
  //
  // }
}
