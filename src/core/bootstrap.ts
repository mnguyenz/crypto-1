import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from '~app.module';
import { env } from '~config/env.config';
import {
    SWAGGER_API_DESCRIPTION,
    SWAGGER_API_NAME,
    SWAGGER_API_ROOT,
    SWAGGER_API_VERSION
} from './constants/swagger.constant';

export class Bootstrap {
    private app: NestExpressApplication;

    async initApp(): Promise<void> {
        this.app = await NestFactory.create<NestExpressApplication>(AppModule);
    }

    initCors(): void {
        this.app.enableCors();
    }

    buildSwagger(): void {
        const options = new DocumentBuilder()
            .setTitle(SWAGGER_API_NAME)
            .setDescription(SWAGGER_API_DESCRIPTION)
            .setVersion(SWAGGER_API_VERSION)
            .addBearerAuth()
            .build();

        const document = SwaggerModule.createDocument(this.app, options);
        SwaggerModule.setup(SWAGGER_API_ROOT, this.app, document);
    }

    async start(): Promise<void> {
        await this.app.listen(env.APP_PORT);
    }
}
