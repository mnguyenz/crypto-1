import { DynamicModule, Provider } from '@nestjs/common';
import { getDataSourceToken, TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { EntitiesMetadataStorage } from '@nestjs/typeorm/dist/entities-metadata.storage';
import { DataSource } from 'typeorm';
import { TYPEORM_EX_CUSTOM_REPOSITORY } from '../decorators/custom-repository.decorator';

export const DEFAULT_DATA_SOURCE_NAME = 'default';

export class TypeOrmHelperModule {
    public static forRoot(config: TypeOrmModuleOptions) {
        return TypeOrmModule.forRootAsync({
            useFactory: () => {
                return config;
            },
            dataSourceFactory: async (options) => {
                const dataSource = new DataSource(options);
                setDataSource(dataSource);
                return dataSource;
            }
        });
    }

    public static forCustomRepository<T extends new (...args: any[]) => any>(repositories: T[]): DynamicModule {
        const providers: Provider[] = [];

        EntitiesMetadataStorage.addEntitiesByDataSource(DEFAULT_DATA_SOURCE_NAME, [...repositories]);
        for (const repository of repositories) {
            const entity = Reflect.getMetadata(TYPEORM_EX_CUSTOM_REPOSITORY, repository);

            if (!entity) {
                continue;
            }

            providers.push({
                inject: [getDataSourceToken()],
                provide: repository,
                useFactory: (dataSource: DataSource): typeof repository => {
                    const baseRepository = dataSource.getRepository<any>(entity);
                    return new repository(baseRepository.target, baseRepository.manager, baseRepository.queryRunner);
                }
            });
        }

        return {
            exports: providers,
            module: TypeOrmHelperModule,
            providers
        };
    }
}

const dataSourceContainer: Map<string, DataSource> = new Map();

export function setDataSource(dataSource: DataSource, dataSourceName = 'default') {
    dataSourceContainer.set(dataSourceName, dataSource);
}
