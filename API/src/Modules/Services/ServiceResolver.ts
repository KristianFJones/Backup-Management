// API/src/Modules/Services/ServiceResolver.ts
import {
  Resolver,
  Query,
  Authorized,
  Ctx,
  Mutation,
  Arg,
  ID,
  FieldResolver,
  Root,
} from 'type-graphql';
import { Service } from './ServiceModel';
import { AuthContext } from 'API/Context';
import { ServiceOutput } from './ServiceOutput';
import { Client } from '../Clients/ClientModel';
import { ServiceInput } from './ServiceInput';

@Resolver(() => Service)
export class ServiceResolver {
  @Authorized()
  @Query(() => [Service])
  async services(@Ctx() { currentUser }: AuthContext): Promise<Service[]> {
    return Service.find({ userId: currentUser.id });
  }

  @Authorized()
  @Query(() => Service)
  async service(
    @Arg('serviceId', () => ID) serviceId: string,
    @Ctx() { currentUser }: AuthContext,
  ): Promise<Service> {
    return Service.findOneOrFail({
      where: { userId: currentUser.id, id: serviceId },
    });
  }

  @Authorized()
  @Mutation(() => ServiceOutput)
  async createService(
    @Arg('input', () => ServiceInput) input: ServiceInput,
    @Ctx() { currentUser }: AuthContext,
  ): Promise<ServiceOutput> {
    const service = Service.create({ ...input, userId: currentUser.id });

    await service.save();

    return { currentUser };
  }

  @Authorized()
  @Mutation(() => ServiceOutput)
  async updateService(
    @Arg('serviceId', () => ID) serviceId: string,
    @Arg('update') update: ServiceInput,
    @Ctx() { currentUser }: AuthContext,
  ): Promise<ServiceOutput> {
    const service = await Service.findOneOrFail({
      where: { id: serviceId, userId: currentUser.id },
    });

    console.log(service);
    return { currentUser };
  }

  @Authorized()
  @Mutation(() => ServiceOutput)
  async deleteService(
    @Arg('serviceId', () => ID) serviceId: string,
    @Ctx() { currentUser }: AuthContext,
  ): Promise<ServiceOutput> {
    const service = await Service.getUserService(serviceId, currentUser);

    await service.remove();

    return { currentUser };
  }

  @Authorized()
  @FieldResolver(() => [Client], { nullable: 'items' })
  async clients(
    @Root() service: Service,
    @Ctx() { currentUser }: AuthContext,
  ): Promise<Client[]> {
    return Client.find({
      where: { serviceId: service.id, userId: currentUser.id },
    });
  }
}
