import { env } from '~config/env.config';
import { Bootstrap } from './core/bootstrap';

async function startApp(): Promise<void> {
    const bootstrap = new Bootstrap();
    await bootstrap.initApp();
    bootstrap.initCors();
    bootstrap.buildSwagger();
    await bootstrap.start();
}

startApp()
    .then(() => console.log(`Init app on port ${env.APP_PORT}`))
    .catch(console.error);
