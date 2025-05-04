import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import { isDev } from 'src/utils/isDev';
import type { GqlContent } from '../common/interfaces/gql-context.interface';

export const getGqlConfig = (configService: ConfigService): ApolloDriverConfig => {
  return {
    driver: ApolloDriver,
    autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
    sortSchema: true,
    playground: isDev(configService),
    context: ({ req, res }: GqlContent) => ({ req, res }),
  };
};
