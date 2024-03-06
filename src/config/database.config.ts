import { TypeOrmModule } from '@nestjs/typeorm';
import { env } from './env.config';
import { DataSource } from 'typeorm';

const config = {
    type: env.DATABASE.CONNECT,
    host: env.DATABASE.HOST,
    port: env.DATABASE.PORT,
    username: env.DATABASE.USER,
    password: env.DATABASE.PASSWORD,
    database: env.DATABASE.NAME,
    entities: [__dirname + './../**/*.entity.{ts,js}'],
    synchronize: true,
    keepConnectionAlive: true,
    autoLoadEntities: true,
    logging: false
};

export const databaseConfig = TypeOrmModule.forRootAsync({
    useFactory: () => {
        return config;
    },
    dataSourceFactory: async (options) => {
        const dataSource = new DataSource(options);
        setDataSource(dataSource);
        return dataSource;
    }
});

const dataSourceContainer: Map<string, DataSource> = new Map();

function setDataSource(dataSource: DataSource, dataSourceName = 'default') {
    dataSourceContainer.set(dataSourceName, dataSource);
}
